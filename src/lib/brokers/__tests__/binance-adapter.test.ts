import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { binanceAdapter } from "@/lib/brokers/binance-adapter";
import type { BrokerCredentials } from "@/lib/brokers/types";

const creds: BrokerCredentials = {
  apiKey: "test-binance-key",
  apiSecret: "test-binance-secret",
  environment: "live",
};

const mockAccountInfo = {
  balances: [
    { asset: "BTC", free: "0.5", locked: "0" },
    { asset: "ETH", free: "2.0", locked: "0.5" },
    { asset: "USDT", free: "1000", locked: "0" },
    { asset: "DOGE", free: "0", locked: "0" }, // zero balance, should be filtered
  ],
};

const mockTickers = [
  { symbol: "BTCUSDT", price: "60000.00" },
  { symbol: "ETHUSDT", price: "3000.00" },
];

describe("binanceAdapter", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("has correct metadata", () => {
    expect(binanceAdapter.source).toBe("binance");
    expect(binanceAdapter.label).toBe("Binance");
    expect(binanceAdapter.authType).toBe("api_key");
  });

  describe("getPositions", () => {
    it("fetches balances and prices, returns non-zero positions", async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockAccountInfo), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockTickers), { status: 200 }),
        );

      const positions = await binanceAdapter.getPositions(creds);

      // Should include BTC, ETH, USDT (non-zero); exclude DOGE (zero)
      expect(positions).toHaveLength(3);

      const btc = positions.find((p) => p.ticker === "BTC");
      expect(btc).toBeDefined();
      expect(btc!.quantity).toBe(0.5);
      expect(btc!.currentPrice).toBe(60000);
      expect(btc!.value).toBe(30000);
      expect(btc!.investmentType).toBe("crypto");

      const eth = positions.find((p) => p.ticker === "ETH");
      expect(eth).toBeDefined();
      expect(eth!.quantity).toBe(2.5); // free + locked
      expect(eth!.currentPrice).toBe(3000);
      expect(eth!.value).toBe(7500);

      const usdt = positions.find((p) => p.ticker === "USDT");
      expect(usdt).toBeDefined();
      expect(usdt!.currentPrice).toBe(1); // stablecoin
      expect(usdt!.value).toBe(1000);
    });

    it("handles empty balances", async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ balances: [] }), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify([]), { status: 200 }),
        );

      const positions = await binanceAdapter.getPositions(creds);
      expect(positions).toHaveLength(0);
    });

    it("includes X-MBX-APIKEY header with signed request", async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ balances: [] }), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify([]), { status: 200 }),
        );

      await binanceAdapter.getPositions(creds);

      // First call is the signed account request
      const [url, opts] = vi.mocked(fetch).mock.calls[0];
      expect(String(url)).toContain("/api/v3/account");
      expect(String(url)).toContain("signature=");
      expect((opts as RequestInit).headers).toMatchObject({
        "X-MBX-APIKEY": "test-binance-key",
      });
    });
  });

  describe("getSummary", () => {
    it("sums positions into totalValue with zero cash", async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockAccountInfo), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockTickers), { status: 200 }),
        );

      const summary = await binanceAdapter.getSummary(creds);

      expect(summary.cash).toBe(0);
      expect(summary.totalValue).toBe(30000 + 7500 + 1000); // BTC + ETH + USDT
      expect(summary.positions).toHaveLength(3);
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { krakenAdapter } from "@/lib/brokers/kraken-adapter";
import type { BrokerCredentials } from "@/lib/brokers/types";

// Kraken expects base64-encoded private key
const creds: BrokerCredentials = {
  apiKey: "test-kraken-key",
  apiSecret: Buffer.from("test-kraken-secret").toString("base64"),
  environment: "live",
};

const mockBalances = {
  XXBT: "1.5",   // Bitcoin (X prefix)
  XETH: "10.0",  // Ethereum (X prefix)
  ZUSD: "500.0", // USD (Z prefix, stablecoin)
};

const mockTickerResponse = {
  error: [] as string[],
  result: {
    XXBTUSD: { c: ["50000.00", "0.1"] },
    XETHUSD: { c: ["2500.00", "1.0"] },
  },
};

describe("krakenAdapter", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("has correct metadata", () => {
    expect(krakenAdapter.source).toBe("kraken");
    expect(krakenAdapter.label).toBe("Kraken");
    expect(krakenAdapter.authType).toBe("api_key");
  });

  describe("getPositions", () => {
    it("fetches balances, looks up prices, and normalises asset names", async () => {
      // First call: krakenFetch for balances (POST)
      vi.mocked(fetch)
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({ error: [], result: mockBalances }),
            { status: 200 },
          ),
        )
        // Second call: getTickerPrices (GET)
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockTickerResponse), { status: 200 }),
        );

      const positions = await krakenAdapter.getPositions(creds);

      expect(positions).toHaveLength(3);

      const btc = positions.find((p) => p.ticker === "XBT");
      expect(btc).toBeDefined();
      expect(btc!.quantity).toBe(1.5);
      expect(btc!.investmentType).toBe("crypto");

      const eth = positions.find((p) => p.ticker === "ETH");
      expect(eth).toBeDefined();
      expect(eth!.quantity).toBe(10);

      const usd = positions.find((p) => p.ticker === "USD");
      expect(usd).toBeDefined();
      expect(usd!.currentPrice).toBe(1); // stablecoin
    });

    it("sends signed POST to /0/private/Balance", async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({ error: [], result: {} }),
            { status: 200 },
          ),
        );

      await krakenAdapter.getPositions(creds);

      const [url, opts] = vi.mocked(fetch).mock.calls[0];
      expect(url).toBe("https://api.kraken.com/0/private/Balance");
      expect((opts as RequestInit).method).toBe("POST");
      expect((opts as RequestInit).headers).toMatchObject({
        "API-Key": "test-kraken-key",
      });
    });

    it("throws on Kraken API error in response body", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: ["EGeneral:Invalid arguments"], result: {} }),
          { status: 200 },
        ),
      );

      await expect(krakenAdapter.getPositions(creds)).rejects.toThrow(
        "Kraken API error: EGeneral:Invalid arguments",
      );
    });
  });

  describe("getSummary", () => {
    it("sums position values", async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({ error: [], result: mockBalances }),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockTickerResponse), { status: 200 }),
        );

      const summary = await krakenAdapter.getSummary(creds);

      expect(summary.cash).toBe(0);
      expect(summary.positions).toHaveLength(3);
      expect(summary.totalValue).toBeGreaterThan(0);
    });
  });
});

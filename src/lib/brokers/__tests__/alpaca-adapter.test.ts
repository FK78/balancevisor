import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { alpacaAdapter } from "@/lib/brokers/alpaca-adapter";
import type { BrokerCredentials } from "@/lib/brokers/types";

const creds: BrokerCredentials = {
  apiKey: "PKTEST123",
  apiSecret: "secret456",
  environment: "paper",
};

const mockAccount = {
  id: "acc-1",
  portfolio_value: "15000.00",
  cash: "5000.00",
  equity: "15000.00",
};

const mockPositions = [
  {
    asset_id: "asset-1",
    symbol: "AAPL",
    exchange: "NASDAQ",
    asset_class: "us_equity",
    avg_entry_price: "150.00",
    qty: "10",
    side: "long",
    market_value: "1700.00",
    cost_basis: "1500.00",
    unrealized_pl: "200.00",
    unrealized_plpc: "0.1333",
    current_price: "170.00",
    asset_marginable: true,
  },
  {
    asset_id: "asset-2",
    symbol: "BTCUSD",
    exchange: "CBSE",
    asset_class: "crypto",
    avg_entry_price: "40000.00",
    qty: "0.5",
    side: "long",
    market_value: "22500.00",
    cost_basis: "20000.00",
    unrealized_pl: "2500.00",
    unrealized_plpc: "0.125",
    current_price: "45000.00",
    asset_marginable: false,
  },
];

describe("alpacaAdapter", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("has correct metadata", () => {
    expect(alpacaAdapter.source).toBe("alpaca");
    expect(alpacaAdapter.label).toBe("Alpaca");
    expect(alpacaAdapter.authType).toBe("api_key");
  });

  describe("getPositions", () => {
    it("fetches and normalises positions", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockPositions), { status: 200 }),
      );

      const positions = await alpacaAdapter.getPositions(creds);

      expect(fetch).toHaveBeenCalledOnce();
      const [url, opts] = vi.mocked(fetch).mock.calls[0];
      expect(url).toBe("https://paper-api.alpaca.markets/v2/positions");
      expect((opts as RequestInit).headers).toMatchObject({
        "APCA-API-KEY-ID": "PKTEST123",
        "APCA-API-SECRET-KEY": "secret456",
      });

      expect(positions).toHaveLength(2);
      expect(positions[0]).toMatchObject({
        ticker: "AAPL",
        name: "AAPL",
        quantity: 10,
        averagePrice: 150,
        currentPrice: 170,
        currency: "USD",
        value: 1700,
        gainLoss: 200,
        investmentType: "stock",
      });
      expect(positions[1]).toMatchObject({
        ticker: "BTCUSD",
        investmentType: "crypto",
      });
    });

    it("uses live URL when environment is live", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      await alpacaAdapter.getPositions({ ...creds, environment: "live" });

      const [url] = vi.mocked(fetch).mock.calls[0];
      expect(url).toBe("https://api.alpaca.markets/v2/positions");
    });

    it("throws on API error", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response("Unauthorized", { status: 401 }),
      );

      await expect(alpacaAdapter.getPositions(creds)).rejects.toThrow(
        "Alpaca API error 401",
      );
    });
  });

  describe("getSummary", () => {
    it("combines account and positions data", async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockAccount), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockPositions), { status: 200 }),
        );

      const summary = await alpacaAdapter.getSummary(creds);

      expect(summary.totalValue).toBe(15000);
      expect(summary.cash).toBe(5000);
      expect(summary.positions).toHaveLength(2);
    });
  });
});

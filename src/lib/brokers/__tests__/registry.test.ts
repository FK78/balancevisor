import { describe, it, expect } from "vitest";
import { getAdapter, BROKER_META, BROKER_LIST } from "@/lib/brokers";
import { BROKER_SOURCES } from "@/lib/brokers/types";
import type { BrokerSource } from "@/lib/brokers/types";

describe("broker registry", () => {
  describe("getAdapter", () => {
    it.each(BROKER_SOURCES)("returns an adapter for %s", (source) => {
      const adapter = getAdapter(source);
      expect(adapter).toBeDefined();
      expect(adapter.source).toBe(source);
      expect(typeof adapter.label).toBe("string");
      expect(["api_key", "oauth"]).toContain(adapter.authType);
      expect(typeof adapter.getPositions).toBe("function");
      expect(typeof adapter.getSummary).toBe("function");
    });

    it("throws for unknown broker source", () => {
      expect(() => getAdapter("unknown" as BrokerSource)).toThrow(
        "Unknown broker source: unknown",
      );
    });
  });

  describe("BROKER_META", () => {
    it("has metadata for every broker source", () => {
      for (const source of BROKER_SOURCES) {
        const meta = BROKER_META[source];
        expect(meta).toBeDefined();
        expect(meta.source).toBe(source);
        expect(meta.label).toBeTruthy();
        expect(meta.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(meta.helpUrl).toMatch(/^https?:\/\//);
      }
    });

    it("api_key brokers have at least one field", () => {
      for (const source of BROKER_SOURCES) {
        const meta = BROKER_META[source];
        if (meta.authType === "api_key") {
          expect(meta.fields.length).toBeGreaterThan(0);
        }
      }
    });

    it("oauth brokers have no fields", () => {
      for (const source of BROKER_SOURCES) {
        const meta = BROKER_META[source];
        if (meta.authType === "oauth") {
          expect(meta.fields.length).toBe(0);
        }
      }
    });

    it("fields have required properties", () => {
      for (const source of BROKER_SOURCES) {
        const meta = BROKER_META[source];
        for (const field of meta.fields) {
          expect(field.name).toBeTruthy();
          expect(field.label).toBeTruthy();
          expect(["text", "password", "select"]).toContain(field.type);
          expect(typeof field.required).toBe("boolean");
          if (field.type === "select") {
            expect(field.options).toBeDefined();
            expect(field.options!.length).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  describe("BROKER_LIST", () => {
    it("includes all broker sources", () => {
      expect(BROKER_LIST.length).toBe(BROKER_SOURCES.length);
      const sources = BROKER_LIST.map((m) => m.source);
      for (const source of BROKER_SOURCES) {
        expect(sources).toContain(source);
      }
    });
  });

  describe("BROKER_SOURCES", () => {
    it("has no duplicates", () => {
      const unique = new Set(BROKER_SOURCES);
      expect(unique.size).toBe(BROKER_SOURCES.length);
    });

    it("includes expected brokers", () => {
      expect(BROKER_SOURCES).toContain("trading212");
      expect(BROKER_SOURCES).toContain("alpaca");
      expect(BROKER_SOURCES).toContain("ibkr");
      expect(BROKER_SOURCES).toContain("coinbase");
      expect(BROKER_SOURCES).toContain("binance");
      expect(BROKER_SOURCES).toContain("kraken");
    });
  });
});

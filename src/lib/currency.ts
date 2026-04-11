export const SUPPORTED_BASE_CURRENCIES = ["GBP", "USD", "EUR", "CAD", "AUD"] as const;

export type BaseCurrency = (typeof SUPPORTED_BASE_CURRENCIES)[number];

export const DEFAULT_BASE_CURRENCY: BaseCurrency = "GBP";

export function normalizeBaseCurrency(value?: string | null): BaseCurrency {
  if (!value) {
    return DEFAULT_BASE_CURRENCY;
  }

  const normalized = value.toUpperCase() as BaseCurrency;
  if (SUPPORTED_BASE_CURRENCIES.includes(normalized)) {
    return normalized;
  }

  return DEFAULT_BASE_CURRENCY;
}

// Sub-unit currencies used by exchanges (e.g. GBX = pence on LSE)
const SUB_UNIT_CURRENCIES: Record<string, { major: string; divisor: number }> = {
  GBX: { major: "GBP", divisor: 100 },
  GBp: { major: "GBP", divisor: 100 },
  ZAc: { major: "ZAR", divisor: 100 },
  ILA: { major: "ILS", divisor: 100 },
};

export function normalizeSubUnitCurrency(
  price: number,
  currencyCode: string,
): { price: number; currency: string } {
  const subUnit = SUB_UNIT_CURRENCIES[currencyCode];
  if (subUnit) {
    return { price: price / subUnit.divisor, currency: subUnit.major };
  }
  return { price, currency: currencyCode };
}

export function getSubUnitDivisor(currencyCode: string): number {
  return SUB_UNIT_CURRENCIES[currencyCode]?.divisor ?? 1;
}

export function toMajorCurrency(currencyCode: string): string {
  return SUB_UNIT_CURRENCIES[currencyCode]?.major ?? currencyCode;
}

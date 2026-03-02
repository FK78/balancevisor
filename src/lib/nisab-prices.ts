const GOLD_NISAB_GRAMS = 87.48;
const SILVER_NISAB_GRAMS = 612.36;

const FALLBACK_GOLD_PRICE_PER_GRAM = 65;
const FALLBACK_SILVER_PRICE_PER_GRAM = 0.65;

interface PriceResponse {
  success: boolean;
  data: {
    price: number;
    currency: string;
    lastUpdated: string;
  };
  lastUpdated: string;
}

export async function fetchGoldPrice(): Promise<{
  pricePerGram: number;
  lastUpdated: string | null;
}> {
  try {
    const response = await fetch('https://backend.internal.nisba.co.uk/gold-price', {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const data: PriceResponse = await response.json();
      if (data.success && data.data?.price) {
        return {
          pricePerGram: data.data.price,
          lastUpdated: data.data.lastUpdated,
        };
      }
    }
  } catch (error) {
    console.error('Failed to fetch gold price:', error);
  }

  return {
    pricePerGram: FALLBACK_GOLD_PRICE_PER_GRAM,
    lastUpdated: null,
  };
}

export async function fetchSilverPrice(): Promise<{
  pricePerGram: number;
  lastUpdated: string | null;
}> {
  try {
    const response = await fetch('https://backend.internal.nisba.co.uk/silver-price', {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const data: PriceResponse = await response.json();
      if (data.success && data.data?.price) {
        return {
          pricePerGram: data.data.price,
          lastUpdated: data.data.lastUpdated,
        };
      }
    }
  } catch (error) {
    console.error('Failed to fetch silver price:', error);
  }

  return {
    pricePerGram: FALLBACK_SILVER_PRICE_PER_GRAM,
    lastUpdated: null,
  };
}

export function calculateNisabValue(pricePerGram: number, type: 'gold' | 'silver'): number {
  const grams = type === 'silver' ? SILVER_NISAB_GRAMS : GOLD_NISAB_GRAMS;
  return grams * pricePerGram;
}

export { GOLD_NISAB_GRAMS, SILVER_NISAB_GRAMS, FALLBACK_GOLD_PRICE_PER_GRAM, FALLBACK_SILVER_PRICE_PER_GRAM };

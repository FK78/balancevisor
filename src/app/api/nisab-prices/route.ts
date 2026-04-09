import { NextResponse } from 'next/server';
import {
  fetchGoldPrice,
  fetchSilverPrice,
  calculateNisabValue,
  GOLD_NISAB_GRAMS,
  SILVER_NISAB_GRAMS,
} from '@/lib/nisab-prices';

export async function GET() {
  try {
    const [goldPrice, silverPrice] = await Promise.all([
      fetchGoldPrice(),
      fetchSilverPrice(),
    ]);

    const goldNisab = calculateNisabValue(goldPrice.pricePerGram, 'gold');
    const silverNisab = calculateNisabValue(silverPrice.pricePerGram, 'silver');

    return NextResponse.json({
      success: true,
      data: {
        gold: {
          pricePerGram: goldPrice.pricePerGram,
          nisabValue: goldNisab,
          grams: GOLD_NISAB_GRAMS,
          lastUpdated: goldPrice.lastUpdated,
        },
        silver: {
          pricePerGram: silverPrice.pricePerGram,
          nisabValue: silverNisab,
          grams: SILVER_NISAB_GRAMS,
          lastUpdated: silverPrice.lastUpdated,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch nisab prices',
      },
      { status: 500 }
    );
  }
}

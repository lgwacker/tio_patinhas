import { NextResponse } from 'next/server';
import { DatabaseModule } from '@/data/DatabaseModule';
import { PositionModule } from '@/domain/position/PositionModule';
import { CarteiraCalculator } from '@/domain/calculator/CarteiraCalculator';
import { QuotesService } from '@/domain/quotes/QuotesService';
import { createDatabase } from '@/lib/database-helpers';
import type { Position } from '@/types';

export const dynamic = 'force-dynamic';

async function fetchFreshQuotes(
  positions: Position[],
  quotesService: QuotesService
): Promise<Record<string, number>> {
  await Promise.all(
    positions.map((position) => quotesService.fetchPrice(position.ticker))
  );

  const quotes: Record<string, number> = {};
  for (const position of positions) {
    const price = quotesService.resolve(position.ticker);
    if (price !== null) {
      quotes[position.ticker] = price;
    }
  }
  return quotes;
}

export async function GET() {
  try {
    const db = createDatabase();
    const dbModule = new DatabaseModule(db);
    const positionModule = new PositionModule(dbModule);
    const quotesService = new QuotesService(db, { cacheTtlMinutes: 15 });

    const positions: Position[] = positionModule.getAllPositions();
    const quotes = await fetchFreshQuotes(positions, quotesService);
    const positionsWithValues = CarteiraCalculator.enrichPositions(positions, quotes);

    return NextResponse.json({ positions: positionsWithValues });
  } catch (error) {
    console.error('Error fetching positions with quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions with quotes' },
      { status: 500 }
    );
  }
}

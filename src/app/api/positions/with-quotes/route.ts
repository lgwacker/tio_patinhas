import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { DatabaseModule } from '@/data/DatabaseModule';
import { PositionModule } from '@/domain/position/PositionModule';
import { CarteiraCalculator } from '@/domain/calculator/CarteiraCalculator';
import { QuotesService } from '@/domain/quotes/QuotesService';
import { createDatabase } from '@/lib/database-helpers';
import type { Position } from '@/types';

// Dynamic rendering ensures fresh data on each request (Issue #54)
export const dynamic = 'force-dynamic';

interface QuoteRow {
  ticker: string;
  preco: number;
}

function getAllQuotes(db: Database.Database): Record<string, number> {
  const rows = db.prepare('SELECT ticker, preco FROM quotes').all() as QuoteRow[];
  const quotes: Record<string, number> = {};
  for (const row of rows) {
    quotes[row.ticker] = row.preco;
  }
  return quotes;
}

/**
 * Fetch fresh quotes for all positions to ensure consistent values (Issue #48)
 * This ensures Carteira shows the same values as Position Detail
 */
async function fetchFreshQuotes(
  positions: Position[],
  quotesService: QuotesService
): Promise<Record<string, number>> {
  await Promise.all(
    positions.map(async (position) => {
      await quotesService.fetchPrice(position.ticker);
    })
  );

  // Return all quotes (now fresh from the cache after fetching)
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
    
    // Fetch fresh quotes for consistent values (Issue #48)
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

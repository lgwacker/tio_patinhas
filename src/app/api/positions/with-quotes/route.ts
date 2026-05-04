import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { DatabaseModule } from '@/data/DatabaseModule';
import { PositionModule } from '@/domain/position/PositionModule';
import { CarteiraCalculator } from '@/domain/calculator/CarteiraCalculator';
import { createDatabase } from '@/lib/database-helpers';
import type { Position } from '@/types';

// Force dynamic rendering to prevent stale data caching
// Related to Issue #54: Dashboard shows stale data after creating positions
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

export async function GET() {
  try {
    const db = createDatabase();
    const dbModule = new DatabaseModule(db);
    const positionModule = new PositionModule(dbModule);

    const positions: Position[] = positionModule.getAllPositions();
    const quotes = getAllQuotes(db);
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

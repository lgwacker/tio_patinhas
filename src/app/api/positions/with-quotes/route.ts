import { NextResponse } from 'next/server';
import { getDatabase, getPositionModule } from '@/lib/database';
import { enrichPositionsWithCalculatedValues } from '@/lib/position-helpers';
import type { Position } from '@/types';
import Database from 'better-sqlite3';

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
    const db = getDatabase();
    const positionModule = getPositionModule();

    const positions: Position[] = positionModule.getAllPositions();
    const quotes = getAllQuotes(db);
    const positionsWithValues = enrichPositionsWithCalculatedValues(positions, quotes);

    return NextResponse.json({ positions: positionsWithValues });
  } catch (error) {
    console.error('Error fetching positions with quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions with quotes' },
      { status: 500 }
    );
  }
}

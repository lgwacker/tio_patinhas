import { NextResponse } from 'next/server';
import { getDatabase, getPositionModule } from '@/lib/database';
import type { Position } from '@/types';
import type { PositionWithValues } from '@/lib/carteira-types';
import Database from 'better-sqlite3';

interface QuoteRow {
  ticker: string;
  preco: number;
}

function calculatePercentage(value: number, base: number): number {
  if (base <= 0) return 0;
  return (value / base) * 100;
}

function roundToTwoDecimals(value: number): number {
  return Number(value.toFixed(2));
}

/**
 * Get all cached quotes from the database
 */
function getAllQuotes(db: Database.Database): Record<string, number> {
  const rows = db.prepare('SELECT ticker, preco FROM quotes').all() as QuoteRow[];
  const quotes: Record<string, number> = {};
  
  for (const row of rows) {
    quotes[row.ticker] = row.preco;
  }
  
  return quotes;
}

/**
 * Enrich positions with calculated values using market prices
 */
function enrichPositionsWithMarketPrices(
  positions: Position[],
  quotes: Record<string, number>
): PositionWithValues[] {
  if (!positions.length) return [];

  // Calculate total value for percentual_carteira
  const totalValue = positions.reduce((sum, pos) => {
    const precoAtual = quotes[pos.ticker] ?? pos.preco_medio;
    return sum + pos.quantidade * precoAtual;
  }, 0);

  return positions.map((position) => {
    const precoAtual = quotes[position.ticker] ?? position.preco_medio;
    const valorInvestido = position.quantidade * position.preco_medio;
    const valorAtual = position.quantidade * precoAtual;
    const ganhoValor = valorAtual - valorInvestido;
    const ganhoPercentual = calculatePercentage(ganhoValor, valorInvestido);
    const percentualCarteira = calculatePercentage(valorAtual, totalValue);

    return {
      ...position,
      preco_atual: precoAtual,
      valor_investido: roundToTwoDecimals(valorInvestido),
      valor_atual: roundToTwoDecimals(valorAtual),
      ganho_valor: roundToTwoDecimals(ganhoValor),
      ganho_percentual: roundToTwoDecimals(ganhoPercentual),
      percentual_carteira: roundToTwoDecimals(percentualCarteira),
    };
  });
}

export async function GET() {
  try {
    const db = getDatabase();
    const positionModule = getPositionModule();
    
    // Get all positions
    const positions = positionModule.getAllPositions();
    
    // Get all cached quotes
    const quotes = getAllQuotes(db);
    
    // Enrich positions with calculated values using market prices
    const positionsWithValues = enrichPositionsWithMarketPrices(positions, quotes);

    return NextResponse.json({ positions: positionsWithValues });
  } catch (error) {
    console.error('Error fetching positions with quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions with quotes' },
      { status: 500 }
    );
  }
}

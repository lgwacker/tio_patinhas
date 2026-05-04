import { NextRequest, NextResponse } from 'next/server';
import { getPositionModule, getQuoteService } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const positionModule = getPositionModule();
    const quoteService = getQuoteService();

    // Get position data first to obtain the ticker
    const position = positionModule.getPositionById(id);
    if (!position) {
      return NextResponse.json(
        { error: 'Posição não encontrada' },
        { status: 404 }
      );
    }

    // Fetch current price from quotes service (uses cache or fetches from APIs)
    const precoAtual = await quoteService.fetchPrice(position.ticker) ?? 0;

    // Get position with calculations using the current price
    const result = positionModule.getPositionWithCalculations(id, precoAtual);

    if (!result) {
      return NextResponse.json(
        { error: 'Posição não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      position: result,
      operations: result.operations,
    });
  } catch (error) {
    console.error('Error fetching position:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

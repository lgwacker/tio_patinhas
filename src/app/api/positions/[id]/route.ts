import { NextRequest, NextResponse } from 'next/server';
import { createPositionModule, createQuotesService } from '@/lib/composition-helpers';

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

    const positionModule = createPositionModule();
    const quoteService = createQuotesService();

    const position = positionModule.getPositionById(id);
    if (!position) {
      return NextResponse.json(
        { error: 'Posição não encontrada' },
        { status: 404 }
      );
    }

    const currentPrice = await quoteService.fetchPrice(position.ticker) ?? 0;
    const result = positionModule.getPositionWithCalculations(id, currentPrice);

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

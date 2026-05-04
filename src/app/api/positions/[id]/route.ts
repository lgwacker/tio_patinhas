import { NextRequest, NextResponse } from 'next/server';
import { getPositionModule } from '@/lib/database';

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
    const result = positionModule.getPositionWithCalculations(id, 0);

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

import { NextRequest, NextResponse } from 'next/server';
import { PositionValidationError } from '@/domain/position/PositionModule';
import { createPositionModule } from '@/lib/composition-helpers';
import type { CreateOperationInput } from '@/types';

export async function GET() {
  try {
    const positionModule = createPositionModule();
    const positions = positionModule.getAllPositions();
    return NextResponse.json({ positions });
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      ticker,
      nome,
      classe_ativo,
      setor,
      segmento,
      operation,
    } = body;

    const positionModule = createPositionModule();

    const result = await positionModule.createPositionWithFirstOperation(
      ticker,
      nome,
      classe_ativo,
      operation as CreateOperationInput,
      setor,
      segmento
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof PositionValidationError) {
      return NextResponse.json(
        { error: 'Erro de validação', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating position:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

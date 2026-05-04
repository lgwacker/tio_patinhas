import { NextRequest, NextResponse } from 'next/server';
import { getPositionModule } from '@/lib/database';
import { PositionValidationError } from '@/domain/position/PositionModule';
import type { CreateOperationInput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      position_id,
      tipo,
      data,
      quantidade,
      valor_total,
    } = body;

    const operation: CreateOperationInput = {
      position_id,
      tipo,
      data,
      quantidade,
      valor_total,
    };

    const positionModule = getPositionModule();

    const result = await positionModule.addOperationToPosition(position_id, operation);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof PositionValidationError) {
      return NextResponse.json(
        { error: 'Erro de validação', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating operation:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

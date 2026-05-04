import { NextRequest, NextResponse } from 'next/server';
import { DatabaseModule } from '@/data/DatabaseModule';
import { PositionModule, PositionValidationError } from '@/domain/position/PositionModule';
import { createDatabase } from '@/lib/database-helpers';
import type { CreateOperationInput } from '@/types';

function createPositionModule(): PositionModule {
  const db = createDatabase();
  const dbModule = new DatabaseModule(db);
  return new PositionModule(dbModule);
}

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

    const positionModule = createPositionModule();

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

import { NextRequest, NextResponse } from 'next/server';
import { getPositionModule, getDatabaseModule } from '@/lib/database';

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
    const dbModule = getDatabaseModule();

    const position = dbModule.getPositionById(id);
    
    if (!position) {
      return NextResponse.json(
        { error: 'Posição não encontrada' },
        { status: 404 }
      );
    }

    const operations = dbModule.getOperationsByPositionId(id);

    // Use a mock current price (will be replaced with real quotes later)
    const precoAtual = position.preco_medio; 

    const valorInvestido = position.quantidade * position.preco_medio;
    const valorAtual = position.quantidade * precoAtual;
    const ganhoValor = valorAtual - valorInvestido;
    const ganhoPercentual = valorInvestido > 0 ? (ganhoValor / valorInvestido) * 100 : 0;

    return NextResponse.json({
      position: {
        ...position,
        valorInvestido: Number(valorInvestido.toFixed(2)),
        valorAtual: Number(valorAtual.toFixed(2)),
        ganhoValor: Number(ganhoValor.toFixed(2)),
        ganhoPercentual: Number(ganhoPercentual.toFixed(2)),
        precoAtual,
      },
      operations,
    });
  } catch (error) {
    console.error('Error fetching position:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

import { Operacao, Posicao, GanhoPerda, ValoresPosicao } from '../types';

export function calculateAveragePrice(operations: Operacao[]): number {
  if (!operations?.length) {
    return 0;
  }

  let quantity = 0;
  let totalCost = 0;

  for (const op of operations) {
    if (op.quantidade <= 0 || op.valorTotal < 0) {
      continue;
    }

    if (op.tipo === 'COMPRA') {
      totalCost += op.valorTotal;
      quantity += op.quantidade;
    } else if (op.tipo === 'VENDA') {
      quantity -= op.quantidade;
      
      if (quantity <= 0) {
        quantity = 0;
        totalCost = 0;
      } else {
        // Recalculate total cost based on remaining quantity and current average
        const currentAvg = totalCost / (quantity + op.quantidade);
        totalCost = quantity * currentAvg;
      }
    }
  }

  return quantity > 0 ? totalCost / quantity : 0;
}

export function calculateGainLoss(position: Posicao, currentPrice: number): GanhoPerda {
  if (!position || position.quantidade <= 0 || position.precoMedio <= 0 || currentPrice < 0) {
    return { valor: 0, percentual: 0 };
  }

  const investedValue = position.quantidade * position.precoMedio;
  const currentValue = position.quantidade * currentPrice;
  const gainLossValue = currentValue - investedValue;
  const gainLossPercent = (gainLossValue / investedValue) * 100;

  return {
    valor: Number(gainLossValue.toFixed(2)),
    percentual: Number(gainLossPercent.toFixed(2)),
  };
}

export function calculatePositionValue(
  quantidade: number,
  precoMedio: number,
  precoAtual: number
): ValoresPosicao {
  if (quantidade < 0 || precoMedio < 0 || precoAtual < 0) {
    return {
      valorInvestido: 0,
      valorAtual: 0,
      ganhoPerda: { valor: 0, percentual: 0 },
    };
  }

  const valorInvestido = quantidade * precoMedio;
  const valorAtual = quantidade * precoAtual;
  const ganhoPerda = calculateGainLoss({ ticker: '', quantidade, precoMedio }, precoAtual);

  return {
    valorInvestido: Number(valorInvestido.toFixed(2)),
    valorAtual: Number(valorAtual.toFixed(2)),
    ganhoPerda,
  };
}

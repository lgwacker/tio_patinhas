import type { Position } from '@/types';
import type { PositionWithValues } from './carteira-types';

export function calculatePercentage(value: number, base: number): number {
  if (base <= 0) return 0;
  return (value / base) * 100;
}

function roundToTwoDecimals(value: number): number {
  return Number(value.toFixed(2));
}

export function enrichPositionsWithCalculatedValues(
  positions: Position[],
  quotes?: Record<string, number>
): PositionWithValues[] {
  if (positions.length === 0) return [];

  const totalValue = positions.reduce((sum, pos) => {
    const precoAtual = quotes?.[pos.ticker] ?? pos.preco_medio;
    return sum + pos.quantidade * precoAtual;
  }, 0);

  return positions.map((position) => {
    const precoAtual = quotes?.[position.ticker] ?? position.preco_medio;
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

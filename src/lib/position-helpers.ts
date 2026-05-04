import type { Position } from '@/types';
import type { PositionWithValues } from './carteira-types';

/**
 * Enrich basic Position data with calculated values for display
 * Uses preco_medio as fallback for preco_atual when no market price is available
 */
export function enrichPositionsWithCalculatedValues(
  positions: Position[],
  quotes?: Record<string, number>
): PositionWithValues[] {
  if (!positions.length) return [];

  // Calculate total value for percentual_carteira
  const totalValue = positions.reduce((sum, pos) => {
    const precoAtual = quotes?.[pos.ticker] ?? pos.preco_medio;
    return sum + pos.quantidade * precoAtual;
  }, 0);

  return positions.map((position) => {
    const precoAtual = quotes?.[position.ticker] ?? position.preco_medio;
    const valorInvestido = position.quantidade * position.preco_medio;
    const valorAtual = position.quantidade * precoAtual;
    const ganhoValor = valorAtual - valorInvestido;
    const ganhoPercentual = valorInvestido > 0 ? (ganhoValor / valorInvestido) * 100 : 0;
    const percentualCarteira = totalValue > 0 ? (valorAtual / totalValue) * 100 : 0;

    return {
      ...position,
      preco_atual: precoAtual,
      valor_investido: Number(valorInvestido.toFixed(2)),
      valor_atual: Number(valorAtual.toFixed(2)),
      ganho_valor: Number(ganhoValor.toFixed(2)),
      ganho_percentual: Number(ganhoPercentual.toFixed(2)),
      percentual_carteira: Number(percentualCarteira.toFixed(2)),
    };
  });
}

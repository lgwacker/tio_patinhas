/**
 * Domain/Calculator Module
 * 
 * Deep module for all financial calculations.
 * Pure business logic with no UI or database dependencies.
 * 
 * Functions:
 * - calculateAveragePrice(operations[]): Calculates weighted average price from operations
 * - calculateGainLoss(position, currentPrice): Calculates gain/loss in R$ and %
 * - calculatePositionValue(quantidade, preco_medio, preco_atual): Calculates position value metrics
 */

import { Operacao, Posicao, GanhoPerda, ValoresPosicao } from '../types';

/**
 * Calculates the average price of a position based on its operation history.
 * Uses FIFO-like logic where sell operations reduce quantity but keep the same average price.
 * When all shares are sold, the average price resets for subsequent purchases.
 * 
 * @param operations - Array of buy/sell operations
 * @returns The average price per share
 */
export function calculateAveragePrice(operations: Operacao[]): number {
  if (!operations || operations.length === 0) {
    return 0;
  }

  let totalQuantity = 0;
  let totalCost = 0;
  let averagePrice = 0;

  for (const op of operations) {
    // Skip operations with invalid data
    if (op.quantidade <= 0 || op.valorTotal < 0) {
      continue;
    }

    const unitPrice = op.valorTotal / op.quantidade;

    if (op.tipo === 'COMPRA') {
      if (totalQuantity === 0) {
        // Starting fresh or after selling all
        totalQuantity = op.quantidade;
        totalCost = op.valorTotal;
        averagePrice = unitPrice;
      } else {
        // Weighted average calculation
        totalCost = totalCost + op.valorTotal;
        totalQuantity = totalQuantity + op.quantidade;
        averagePrice = totalCost / totalQuantity;
      }
    } else if (op.tipo === 'VENDA') {
      // Reduce quantity but keep same average price (FIFO-like)
      totalQuantity = totalQuantity - op.quantidade;
      totalCost = totalQuantity * averagePrice;

      // If all sold, reset average price for next purchase
      if (totalQuantity <= 0) {
        totalQuantity = 0;
        totalCost = 0;
        averagePrice = 0;
      }
    }
  }

  return totalQuantity > 0 ? averagePrice : 0;
}

/**
 * Calculates gain/loss for a position given current market price.
 * 
 * @param position - The position with quantity and average price
 * @param currentPrice - Current market price per share
 * @returns Object with gain/loss in R$ (valor) and percentage (percentual)
 */
export function calculateGainLoss(position: Posicao, currentPrice: number): GanhoPerda {
  // Guard against invalid inputs
  if (!position || position.quantidade <= 0 || position.precoMedio <= 0) {
    return { valor: 0, percentual: 0 };
  }

  if (currentPrice < 0) {
    return { valor: 0, percentual: 0 };
  }

  const valorInvestido = position.quantidade * position.precoMedio;
  const valorAtual = position.quantidade * currentPrice;
  const valor = valorAtual - valorInvestido;
  const percentual = (valor / valorInvestido) * 100;

  return {
    valor: Number(valor.toFixed(2)),
    percentual: Number(percentual.toFixed(2)),
  };
}

/**
 * Calculates all value metrics for a position.
 * 
 * @param quantidade - Number of shares
 * @param precoMedio - Average price per share
 * @param precoAtual - Current market price per share
 * @returns Object with invested value, current value, and gain/loss
 */
export function calculatePositionValue(
  quantidade: number,
  precoMedio: number,
  precoAtual: number
): ValoresPosicao {
  // Guard against invalid inputs
  if (quantidade < 0 || precoMedio < 0 || precoAtual < 0) {
    return {
      valorInvestido: 0,
      valorAtual: 0,
      ganhoPerda: { valor: 0, percentual: 0 },
    };
  }

  const valorInvestido = quantidade * precoMedio;
  const valorAtual = quantidade * precoAtual;
  
  let ganhoValor = 0;
  let ganhoPercentual = 0;

  // Only calculate gain/loss if we have valid invested value
  if (valorInvestido > 0) {
    ganhoValor = valorAtual - valorInvestido;
    ganhoPercentual = (ganhoValor / valorInvestido) * 100;
  }

  return {
    valorInvestido: Number(valorInvestido.toFixed(2)),
    valorAtual: Number(valorAtual.toFixed(2)),
    ganhoPerda: {
      valor: Number(ganhoValor.toFixed(2)),
      percentual: Number(ganhoPercentual.toFixed(2)),
    },
  };
}

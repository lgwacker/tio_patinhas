import { Operacao, GanhoPerda } from '../types';

/**
 * Unified position snapshot returned by CarteiraCalculator.
 * Contains all calculated values for a position in a single object.
 */
export interface PositionSnapshot {
  /** Current quantity of shares */
  quantidade: number;
  /** Average purchase price */
  precoMedio: number;
  /** Total invested value (quantidade * precoMedio) */
  valorInvestido: number;
  /** Current market value (quantidade * precoAtual) */
  valorAtual: number;
  /** Gain/loss with value and percentage */
  ganhoPerda: GanhoPerda;
  /** Percentage of portfolio (only when total portfolio value is provided) */
  percentualCarteira: number;
}

/**
 * Deep module for calculating position values.
 * 
 * This module consolidates all Preço Médio, Ganho/Perda, and Valor Investido
 * math into a single place. It replaces scattered calculations in PositionModule,
 * DashboardService, and position-helpers.
 * 
 * The interface accepts a list of Operações and returns a complete, consistent
 * snapshot of a Posição.
 */
export class CarteiraCalculator {
  /**
   * Calculate a complete position snapshot from a list of operations.
   * 
   * @param operations - List of buy/sell operations
   * @param precoAtual - Optional current market price (if not provided, precoMedio is used)
   * @param totalPortfolioValue - Optional total portfolio value for percentage calculation
   * @returns A complete PositionSnapshot with all calculated values
   */
  static calculateSnapshot(
    operations: Operacao[],
    precoAtual?: number | null,
    totalPortfolioValue?: number | null
  ): PositionSnapshot {
    const quantidade = this.calculateQuantity(operations);
    const precoMedio = this.calculateAveragePrice(operations);
    const valorInvestido = quantidade * precoMedio;
    
    // Use precoAtual if provided, otherwise fall back to precoMedio
    const effectivePrecoAtual = precoAtual ?? precoMedio;
    const valorAtual = quantidade * effectivePrecoAtual;
    
    const ganhoPerda = this.calculateGainLoss(valorInvestido, valorAtual);
    
    const percentualCarteira = totalPortfolioValue && totalPortfolioValue > 0
      ? (valorAtual / totalPortfolioValue) * 100
      : 0;

    return {
      quantidade: this.roundToTwoDecimals(quantidade),
      precoMedio: this.roundToTwoDecimals(precoMedio),
      valorInvestido: this.roundToTwoDecimals(valorInvestido),
      valorAtual: this.roundToTwoDecimals(valorAtual),
      ganhoPerda: {
        valor: this.roundToTwoDecimals(ganhoPerda.valor),
        percentual: this.roundToTwoDecimals(ganhoPerda.percentual),
      },
      percentualCarteira: this.roundToTwoDecimals(percentualCarteira),
    };
  }

  /**
   * Calculate current quantity from operations.
   * Buys increase quantity, sells decrease it. Never goes below zero.
   */
  private static calculateQuantity(operations: Operacao[]): number {
    if (!operations?.length) {
      return 0;
    }

    return operations.reduce((quantity, op) => {
      if (op.quantidade <= 0) {
        return quantity;
      }

      if (op.tipo === 'COMPRA') {
        return quantity + op.quantidade;
      } else if (op.tipo === 'VENDA') {
        return Math.max(0, quantity - op.quantidade);
      }
      return quantity;
    }, 0);
  }

  /**
   * Calculate average price using weighted average of buy operations.
   * Sell operations reduce quantity and recalculate total cost.
   */
  private static calculateAveragePrice(operations: Operacao[]): number {
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

  /**
   * Calculate gain/loss from invested and current values.
   */
  private static calculateGainLoss(
    valorInvestido: number,
    valorAtual: number
  ): GanhoPerda {
    if (valorInvestido <= 0) {
      return { valor: 0, percentual: 0 };
    }

    const valor = valorAtual - valorInvestido;
    const percentual = (valor / valorInvestido) * 100;

    return { valor, percentual };
  }

  /**
   * Round a number to two decimal places.
   */
  private static roundToTwoDecimals(value: number): number {
    return Number(value.toFixed(2));
  }
}

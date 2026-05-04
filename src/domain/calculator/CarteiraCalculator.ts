import { Operacao, GanhoPerda } from '../types';

export interface PositionSnapshot {
  quantidade: number;
  precoMedio: number;
  valorInvestido: number;
  valorAtual: number;
  ganhoPerda: GanhoPerda;
  percentualCarteira: number;
}

/**
 * Calculates position values (quantity, average price, invested value,
 * current value, gain/loss) from a list of operations.
 */
export class CarteiraCalculator {
  static calculateSnapshot(
    operations: Operacao[],
    precoAtual?: number | null,
    totalPortfolioValue?: number | null
  ): PositionSnapshot {
    const quantidade = this.calculateQuantity(operations);
    const precoMedio = this.calculateAveragePrice(operations);
    const valorInvestido = quantidade * precoMedio;
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
          const currentAvg = totalCost / (quantity + op.quantidade);
          totalCost = quantity * currentAvg;
        }
      }
    }

    return quantity > 0 ? totalCost / quantity : 0;
  }

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

  private static roundToTwoDecimals(value: number): number {
    return Number(value.toFixed(2));
  }
}

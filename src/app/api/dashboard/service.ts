import { DatabaseModule } from '@/data/DatabaseModule';
import { Position, AssetClass, Operation } from '@/types';
import { QuoteResolver } from '@/domain/quotes';
import { CarteiraCalculator } from '@/domain/calculator/CarteiraCalculator';
import {
  DashboardData,
  DashboardSummary,
  AssetClassDistribution,
  PositionWithQuote,
  RecentOperation,
} from '@/domain/dashboard';

const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  acao: 'Ações',
  fii: 'Fundos Imobiliários',
  renda_fixa: 'Renda Fixa',
  etf: 'ETFs',
  cripto: 'Criptomoedas',
};

function calculatePercentage(value: number, base: number): number {
  if (base <= 0) return 0;
  return (value / base) * 100;
}

function roundToTwoDecimals(value: number): number {
  return Number(value.toFixed(2));
}

/**
 * DashboardService provides aggregated portfolio data for the dashboard view.
 * 
 * Architecture:
 * - Depends on QuoteResolver interface for price lookups (not raw SQL)
 * - Uses CarteiraCalculator for all position value calculations
 * - Accepts dependencies through constructor for testability
 */
export class DashboardService {
  constructor(
    private dataModule: DatabaseModule,
    private quoteResolver: QuoteResolver
  ) {}

  getDashboardData(): DashboardData {
    const positions = this.dataModule.getAllPositions();
    const positionsWithQuotes = this.enrichPositionsWithQuotes(positions);
    
    const summary = this.calculateSummary(positionsWithQuotes);
    const assetClassDistribution = this.calculateAssetClassDistribution(positionsWithQuotes);
    const recentOperations = this.getRecentOperationsWithDetails(5);

    return {
      summary,
      assetClassDistribution,
      recentOperations,
    };
  }

  private enrichPositionsWithQuotes(positions: Position[]): PositionWithQuote[] {
    // Calculate total portfolio value for percentage calculation
    let totalPortfolioValue = 0;
    const enrichedPositions: PositionWithQuote[] = [];

    // First pass: calculate values using CarteiraCalculator
    for (const position of positions) {
      const preco_atual = this.quoteResolver.resolve(position.ticker) ?? position.preco_medio;
      const valor_investido = position.quantidade * position.preco_medio;
      const valor_atual = position.quantidade * preco_atual;
      const ganho_perda_valor = valor_atual - valor_investido;
      const ganho_perda_percentual = calculatePercentage(ganho_perda_valor, valor_investido);

      enrichedPositions.push({
        ...position,
        preco_atual,
        valor_atual: roundToTwoDecimals(valor_atual),
        valor_investido: roundToTwoDecimals(valor_investido),
        ganho_perda_valor: roundToTwoDecimals(ganho_perda_valor),
        ganho_perda_percentual: roundToTwoDecimals(ganho_perda_percentual),
      });

      totalPortfolioValue += valor_atual;
    }

    // Second pass: add portfolio percentage if we have positions
    if (totalPortfolioValue > 0) {
      for (const position of enrichedPositions) {
        position.percentual_carteira = roundToTwoDecimals(
          calculatePercentage(position.valor_atual, totalPortfolioValue)
        );
      }
    }

    return enrichedPositions;
  }

  private calculateSummary(positions: PositionWithQuote[]): DashboardSummary {
    const totalValue = positions.reduce((sum, p) => sum + p.valor_atual, 0);
    const totalInvested = positions.reduce((sum, p) => sum + p.valor_investido, 0);
    const totalGainLossValue = totalValue - totalInvested;
    const totalGainLossPercentage = calculatePercentage(totalGainLossValue, totalInvested);

    return {
      totalValue: roundToTwoDecimals(totalValue),
      totalInvested: roundToTwoDecimals(totalInvested),
      totalGainLoss: {
        value: roundToTwoDecimals(totalGainLossValue),
        percentage: roundToTwoDecimals(totalGainLossPercentage),
      },
      positionCount: positions.length,
    };
  }

  private calculateAssetClassDistribution(positions: PositionWithQuote[]): AssetClassDistribution[] {
    const totalValue = positions.reduce((sum, p) => sum + p.valor_atual, 0);
    
    const grouped = positions.reduce((acc, position) => {
      const classe = position.classe_ativo;
      if (!acc[classe]) {
        acc[classe] = { value: 0, count: 0 };
      }
      acc[classe].value += position.valor_atual;
      acc[classe].count += 1;
      return acc;
    }, {} as Record<AssetClass, { value: number; count: number }>);

    const distribution: AssetClassDistribution[] = Object.entries(grouped).map(([classe, data]) => {
      const assetClass = classe as AssetClass;
      const percentage = calculatePercentage(data.value, totalValue);
      
      return {
        classe_ativo: assetClass,
        label: ASSET_CLASS_LABELS[assetClass],
        value: roundToTwoDecimals(data.value),
        percentage: roundToTwoDecimals(percentage),
        count: data.count,
      };
    });

    return distribution.sort((a, b) => b.value - a.value);
  }

  private getRecentOperationsWithDetails(limit: number): RecentOperation[] {
    const operations = this.dataModule.getRecentOperations(limit);
    
    return operations.map(op => {
      const position = this.dataModule.getPositionById(op.position_id);
      return {
        ...op,
        ticker: position?.ticker ?? '',
        nome: position?.nome ?? '',
      };
    });
  }
}

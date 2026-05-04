import Database from 'better-sqlite3';
import { DatabaseModule } from '@/data/DatabaseModule';
import { Position, AssetClass } from '@/types';
import {
  DashboardData,
  DashboardSummary,
  AssetClassDistribution,
  PositionWithQuote,
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

export class DashboardService {
  private db: Database.Database;
  private dataModule: DatabaseModule;

  constructor(db: Database.Database) {
    this.db = db;
    this.dataModule = new DatabaseModule(db);
  }

  getDashboardData(): DashboardData {
    const positions = this.dataModule.getAllPositions();
    const positionsWithQuotes = this.enrichPositionsWithQuotes(positions);
    
    const summary = this.calculateSummary(positionsWithQuotes);
    const assetClassDistribution = this.calculateAssetClassDistribution(positionsWithQuotes);
    const recentOperations = this.dataModule.getRecentOperations(5);

    return {
      summary,
      assetClassDistribution,
      recentOperations,
    };
  }

  private enrichPositionsWithQuotes(positions: Position[]): PositionWithQuote[] {
    return positions.map(position => {
      const preco_atual = this.getCurrentPrice(position.ticker) ?? position.preco_medio;
      const valor_atual = position.quantidade * preco_atual;
      const valor_investido = position.quantidade * position.preco_medio;
      const ganho_perda_valor = valor_atual - valor_investido;
      const ganho_perda_percentual = calculatePercentage(ganho_perda_valor, valor_investido);

      return {
        ...position,
        preco_atual,
        valor_atual,
        valor_investido,
        ganho_perda_valor,
        ganho_perda_percentual,
      };
    });
  }

  private getCurrentPrice(ticker: string): number | null {
    const row = this.db.prepare('SELECT preco FROM quotes WHERE ticker = ?').get(ticker);
    if (row && typeof row === 'object' && 'preco' in row && typeof row.preco === 'number') {
      return row.preco;
    }
    return null;
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
}

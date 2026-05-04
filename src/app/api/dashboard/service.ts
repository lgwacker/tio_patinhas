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
      // For MVP: use preco_medio as preco_atual if no quote available
      // In future: fetch from quotes table or external API
      const preco_atual = this.getCurrentPrice(position.ticker) ?? position.preco_medio;
      const valor_atual = position.quantidade * preco_atual;
      const valor_investido = position.quantidade * position.preco_medio;
      const ganho_perda_valor = valor_atual - valor_investido;
      const ganho_perda_percentual = valor_investido > 0 
        ? (ganho_perda_valor / valor_investido) * 100 
        : 0;

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
    // MVP: Check if there's a quote in the database
    // Future: Integrate with Yahoo Finance API
    const row = this.db.prepare('SELECT preco FROM quotes WHERE ticker = ?').get(ticker) as { preco: number } | undefined;
    return row?.preco ?? null;
  }

  private calculateSummary(positions: PositionWithQuote[]): DashboardSummary {
    const totalValue = positions.reduce((sum, p) => sum + p.valor_atual, 0);
    const totalInvested = positions.reduce((sum, p) => sum + p.valor_investido, 0);
    const totalGainLossValue = totalValue - totalInvested;
    const totalGainLossPercentage = totalInvested > 0 
      ? (totalGainLossValue / totalInvested) * 100 
      : 0;

    return {
      totalValue: Number(totalValue.toFixed(2)),
      totalInvested: Number(totalInvested.toFixed(2)),
      totalGainLoss: {
        value: Number(totalGainLossValue.toFixed(2)),
        percentage: Number(totalGainLossPercentage.toFixed(2)),
      },
      positionCount: positions.length,
    };
  }

  private calculateAssetClassDistribution(positions: PositionWithQuote[]): AssetClassDistribution[] {
    const totalValue = positions.reduce((sum, p) => sum + p.valor_atual, 0);
    
    // Group by asset class
    const grouped = positions.reduce((acc, position) => {
      const classe = position.classe_ativo;
      if (!acc[classe]) {
        acc[classe] = { value: 0, count: 0 };
      }
      acc[classe].value += position.valor_atual;
      acc[classe].count += 1;
      return acc;
    }, {} as Record<AssetClass, { value: number; count: number }>);

    // Convert to array with percentages
    const distribution: AssetClassDistribution[] = Object.entries(grouped).map(([classe, data]) => {
      const assetClass = classe as AssetClass;
      const percentage = totalValue > 0 ? (data.value / totalValue) * 100 : 0;
      
      return {
        classe_ativo: assetClass,
        label: ASSET_CLASS_LABELS[assetClass],
        value: Number(data.value.toFixed(2)),
        percentage: Number(percentage.toFixed(2)),
        count: data.count,
      };
    });

    // Sort by value descending
    return distribution.sort((a, b) => b.value - a.value);
  }
}

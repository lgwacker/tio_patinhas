import { Position, Operation, AssetClass } from '@/types';

export interface DashboardSummary {
  totalValue: number;
  totalInvested: number;
  totalGainLoss: {
    value: number;
    percentage: number;
  };
  positionCount: number;
}

export interface AssetClassDistribution {
  classe_ativo: AssetClass;
  label: string;
  value: number;
  percentage: number;
  count: number;
}

export interface RecentOperation extends Operation {
  ticker: string;
  nome: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  assetClassDistribution: AssetClassDistribution[];
  recentOperations: RecentOperation[];
}

export interface PositionWithQuote extends Position {
  preco_atual: number;
  valor_atual: number;
  valor_investido: number;
  ganho_perda_valor: number;
  ganho_perda_percentual: number;
  percentual_carteira?: number;
}

export interface Quote {
  ticker: string;
  preco: number;
  updated_at: string;
}

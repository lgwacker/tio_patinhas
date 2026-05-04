export type AssetClass = 'acao' | 'fii' | 'renda_fixa' | 'etf' | 'cripto';

export interface AssetClassTab {
  value: AssetClass;
  label: string;
}

export const ASSET_CLASS_TABS: AssetClassTab[] = [
  { value: 'acao', label: 'Ações' },
  { value: 'fii', label: 'FIIs' },
  { value: 'renda_fixa', label: 'Renda Fixa' },
  { value: 'etf', label: 'ETFs' },
  { value: 'cripto', label: 'Cripto' },
];

export type OperationType = 'compra' | 'venda';

export interface Position {
  id: number;
  ticker: string;
  nome: string;
  classe_ativo: AssetClass;
  setor: string | null;
  segmento: string | null;
  quantidade: number;
  preco_medio: number;
  data_criacao: string;
  updated_at: string;
}

export interface Operation {
  id: number;
  position_id: number;
  tipo: OperationType;
  data: string;
  quantidade: number;
  valor_total: number;
  preco_unitario: number;
  created_at: string;
}

export interface Config {
  chave: string;
  valor: string;
  updated_at: string;
}

export interface CreatePositionInput {
  ticker: string;
  nome: string;
  classe_ativo: AssetClass;
  setor?: string | null;
  segmento?: string | null;
  quantidade: number;
  preco_medio: number;
}

export interface CreateOperationInput {
  position_id: number;
  tipo: OperationType;
  data: string;
  quantidade: number;
  valor_total: number;
}

export interface UpdatePositionInput {
  nome?: string;
  setor?: string | null;
  segmento?: string | null;
  quantidade?: number;
  preco_medio?: number;
}

export interface PositionWithValues extends Position {
  preco_atual: number;
  valor_investido: number;
  valor_atual: number;
  ganho_valor: number;
  ganho_percentual: number;
  percentual_carteira: number;
}

export interface PositionWithQuote extends Position {
  preco_atual: number;
  valor_atual: number;
  valor_investido: number;
  ganho_perda_valor: number;
  ganho_perda_percentual: number;
  percentual_carteira?: number;
}

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

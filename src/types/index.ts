export type AssetClass = 'acao' | 'fii' | 'renda_fixa' | 'etf' | 'cripto';

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

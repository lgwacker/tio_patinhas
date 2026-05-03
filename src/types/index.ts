/**
 * Classe de Ativo - categoria do investimento
 */
export type AssetClass = 'acao' | 'fii' | 'renda_fixa' | 'etf' | 'cripto';

/**
 * Tipo de Operação - compra ou venda
 */
export type OperationType = 'compra' | 'venda';

/**
 * Posição - um ativo na carteira
 */
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

/**
 * Operação - evento que modifica uma posição
 */
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

/**
 * Configuração - chave-valor para preferências
 */
export interface Config {
  chave: string;
  valor: string;
  updated_at: string;
}

/**
 * Dados para criar uma nova posição
 */
export interface CreatePositionInput {
  ticker: string;
  nome: string;
  classe_ativo: AssetClass;
  setor?: string | null;
  segmento?: string | null;
  quantidade: number;
  preco_medio: number;
}

/**
 * Dados para criar uma nova operação
 */
export interface CreateOperationInput {
  position_id: number;
  tipo: OperationType;
  data: string;
  quantidade: number;
  valor_total: number;
}

/**
 * Dados para atualizar uma posição
 */
export interface UpdatePositionInput {
  nome?: string;
  setor?: string | null;
  segmento?: string | null;
  quantidade?: number;
  preco_medio?: number;
}

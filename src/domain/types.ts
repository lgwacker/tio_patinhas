/**
 * Domain types for Tio Patinhas investment system
 */

/**
 * Tipo de operação: Compra (buy) or Venda (sell)
 */
export type TipoOperacao = 'COMPRA' | 'VENDA';

/**
 * Uma operação que modifica uma posição
 * - COMPRA: aumenta a posição
 * - VENDA: diminui a posição (venda a descoberto não permitida no MVP)
 */
export interface Operacao {
  /** Data da operação */
  data: Date;
  /** Tipo: COMPRA ou VENDA */
  tipo: TipoOperacao;
  /** Quantidade de ações */
  quantidade: number;
  /** Valor total da operação em R$ */
  valorTotal: number;
}

/**
 * Uma posição de ativo na carteira
 */
export interface Posicao {
  /** Ticker do ativo (ex: PETR4) */
  ticker: string;
  /** Quantidade atual de ações */
  quantidade: number;
  /** Preço médio de aquisição */
  precoMedio: number;
}

/**
 * Resultado do cálculo de ganho/perda
 */
export interface GanhoPerda {
  /** Valor absoluto em R$ */
  valor: number;
  /** Percentual de variação */
  percentual: number;
}

/**
 * Valores calculados de uma posição
 */
export interface ValoresPosicao {
  /** Valor total investido (quantidade * preco_medio) */
  valorInvestido: number;
  /** Valor atual de mercado (quantidade * preco_atual) */
  valorAtual: number;
  /** Ganho ou perda em R$ */
  ganhoPerda: GanhoPerda;
}

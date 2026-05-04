import type { AssetClass, Position } from '@/types';

/**
 * Extended position with calculated values for display
 */
export interface PositionWithValues extends Position {
  /** Current market price */
  preco_atual: number;
  /** Total invested (quantidade * preco_medio) */
  valor_investido: number;
  /** Current value (quantidade * preco_atual) */
  valor_atual: number;
  /** Gain/loss in R$ */
  ganho_valor: number;
  /** Gain/loss percentage */
  ganho_percentual: number;
  /** Percentage of total portfolio */
  percentual_carteira: number;
}

/**
 * Props for position list components
 */
export interface PositionListProps {
  positions: PositionWithValues[];
  onPositionClick?: (position: PositionWithValues) => void;
}

/**
 * Tab configuration for asset class filtering
 */
export interface AssetClassTab {
  value: AssetClass;
  label: string;
}

/**
 * Asset class display mapping
 */
export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  acao: 'Ações',
  fii: 'FIIs',
  renda_fixa: 'Renda Fixa',
  etf: 'ETFs',
  cripto: 'Cripto',
};

/**
 * All asset classes for tabs
 */
export const ASSET_CLASS_TABS: AssetClassTab[] = [
  { value: 'acao', label: 'Ações' },
  { value: 'fii', label: 'FIIs' },
  { value: 'renda_fixa', label: 'Renda Fixa' },
  { value: 'etf', label: 'ETFs' },
  { value: 'cripto', label: 'Cripto' },
];

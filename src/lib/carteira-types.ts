import type { AssetClass, Position } from '@/types';

export interface PositionWithValues extends Position {
  preco_atual: number;
  valor_investido: number;
  valor_atual: number;
  ganho_valor: number;
  ganho_percentual: number;
  percentual_carteira: number;
}

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


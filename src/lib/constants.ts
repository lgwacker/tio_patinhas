export const VALID_ASSET_CLASSES = ['acao', 'fii', 'renda_fixa', 'etf', 'cripto'] as const;

export type AssetClass = typeof VALID_ASSET_CLASSES[number];

export interface AssetClassOption {
  value: AssetClass;
  label: string;
}

export const ASSET_CLASSES: AssetClassOption[] = [
  { value: 'acao', label: 'Ação' },
  { value: 'fii', label: 'Fundo Imobiliário (FII)' },
  { value: 'renda_fixa', label: 'Renda Fixa' },
  { value: 'etf', label: 'ETF' },
  { value: 'cripto', label: 'Criptomoeda' },
];

export const VALID_ASSET_CLASSES = ['acao', 'fii', 'renda_fixa', 'etf', 'cripto'] as const;

export type AssetClass = typeof VALID_ASSET_CLASSES[number];

export interface AssetClassOption {
  value: AssetClass;
  label: string;
}

/**
 * Validation limits for numeric form inputs.
 * These prevent browser accessibility issues where empty max attributes
 * cause valuemax="0" to be inferred, contradicting min values.
 */
export const VALIDATION_LIMITS = {
  quantidade: { min: 1, max: 999_999_999 },
  valorTotal: { min: 0.01, max: 999_999_999_999 },
} as const;

export const ASSET_CLASSES: AssetClassOption[] = [
  { value: 'acao', label: 'Ação' },
  { value: 'fii', label: 'Fundo Imobiliário (FII)' },
  { value: 'renda_fixa', label: 'Renda Fixa' },
  { value: 'etf', label: 'ETF' },
  { value: 'cripto', label: 'Criptomoeda' },
];

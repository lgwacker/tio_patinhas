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
 * 
 * IMPORTANT: All values are strings to prevent IEEE 754 floating-point
 * precision leaks in HTML attributes (e.g., 0.01 becoming "0.009999999776482582").
 */
export const VALIDATION_LIMITS = {
  quantidade: { min: '1', max: '999999999' },
  valorTotal: { min: '0.01', max: '999999999999' },
} as const;

export const ASSET_CLASSES: AssetClassOption[] = [
  { value: 'acao', label: 'Ação' },
  { value: 'fii', label: 'Fundo Imobiliário (FII)' },
  { value: 'renda_fixa', label: 'Renda Fixa' },
  { value: 'etf', label: 'ETF' },
  { value: 'cripto', label: 'Criptomoeda' },
];

/**
 * Design System Colors (from tailwind.config.ts)
 * These are the source of truth for accessibility testing.
 */
export const DESIGN_SYSTEM_COLORS = {
  background: '#0F172A',
  surface: '#1E293B',
  primary: '#1D4ED8',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
  blue600: '#2563EB',
  white: '#FFFFFF',
} as const;

/**
 * The opacity applied to disabled buttons.
 * This value was determined through accessibility testing to ensure
 * sufficient color contrast (WCAG AA 4.5:1) in disabled states.
 * 
 * Changing this value requires updating the corresponding test in
 * color-contrast.test.ts to verify accessibility compliance.
 */
export const DISABLED_OPACITY = 0.7;

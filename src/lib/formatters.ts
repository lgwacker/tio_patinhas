import { ASSET_CLASSES, type AssetClass } from './constants';

/**
 * Format number as Brazilian Real currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format number as percentage with sign
 */
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format percentage without sign (for portfolio allocation)
 */
export function formatPercentageAbsolute(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format quantity of shares
 */
export function formatQuantity(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format date string to Brazilian format (DD/MM/YYYY)
 * Parses the date as local time to avoid UTC timezone issues
 */
export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
}

/**
 * Calculate unit price from total value and quantity
 * Returns formatted string with 2 decimal places or '--' if inputs are invalid
 */
export function calcularPrecoUnitario(quantidade: string, valorTotal: string): string {
  const qtd = parseInt(quantidade, 10);
  const total = parseFloat(valorTotal);
  if (qtd > 0 && total > 0) {
    return (total / qtd).toFixed(2);
  }
  return '--';
}

export function formatAssetClassLabel(assetClass: AssetClass): string {
  const option = ASSET_CLASSES.find((c) => c.value === assetClass);
  return option?.label ?? assetClass;
}

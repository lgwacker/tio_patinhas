/**
 * Get badge styling classes for operation type
 */
export function getOperationTypeBadgeClasses(tipo: 'compra' | 'venda'): string {
  if (tipo === 'compra') {
    return 'bg-green-900/30 text-green-400';
  }
  return 'bg-red-900/30 text-red-400';
}

/**
 * Get text color classes for profit/loss indication
 */
export function getProfitLossColorClasses(isProfit: boolean): string {
  return isProfit ? 'text-profit' : 'text-loss';
}

/**
 * Format a percentage value for display with +/- sign
 * Example: 5.5 -> "+5.50%", -3.2 -> "-3.20%"
 */
export function formatGainLossPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

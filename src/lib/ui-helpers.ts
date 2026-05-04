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

/**
 * Format number as Brazilian Real currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format date string to Brazilian format (DD/MM/YYYY)
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
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

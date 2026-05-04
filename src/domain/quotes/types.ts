export interface QuoteData {
  ticker: string;
  preco: number;
  fonte: 'yahoo' | 'brapi' | 'cache' | 'manual';
  updatedAt: Date;
}

export interface QuoteResult {
  success: boolean;
  data?: QuoteData;
  error?: string;
}

export interface QuoteCacheEntry {
  ticker: string;
  preco: number;
  updated_at: string;
}

/**
 * Interface for resolving a ticker to its current price.
 * This abstraction allows DashboardService to depend on an interface
 * rather than raw SQL or specific implementations.
 */
export interface QuoteResolver {
  /**
   * Resolve the current price for a ticker.
   * @param ticker - The ticker symbol (e.g., 'PETR4')
   * @returns The current price, or null if not available
   */
  resolve(ticker: string): number | null;
}

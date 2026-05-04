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
 * 
 * This interface defines the seam between the Dashboard and the Quotes module.
 * DashboardService depends on this interface, not on raw SQL or Database handles.
 * 
 * Implementations:
 * - QuotesService: Fetches from cache/adapters
 * - Test stubs: Return fixed prices for deterministic testing
 */
export interface QuoteResolver {
  /**
   * Resolve the current price for a ticker.
   * 
   * @param ticker - The ticker symbol (e.g., 'PETR4')
   * @returns The current price as a number, or null if not available
   */
  resolve(ticker: string): number | null;
}

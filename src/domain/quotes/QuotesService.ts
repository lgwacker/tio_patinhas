import Database from 'better-sqlite3';
import { QuoteData, QuoteResult, QuoteResolver } from './types';
import { QuoteCache } from './QuoteCache';
import { YahooFinanceAdapter, BrapiAdapter } from './adapters';

export interface QuotesServiceConfig {
  cacheTtlMinutes: number;
}

export class QuotesService implements QuoteResolver {
  private cache: QuoteCache;
  private yahooAdapter: YahooFinanceAdapter;
  private brapiAdapter: BrapiAdapter;

  constructor(
    db: Database.Database,
    config: Partial<QuotesServiceConfig> = {}
  ) {
    this.cache = new QuoteCache(db, config.cacheTtlMinutes ?? 15);
    this.yahooAdapter = new YahooFinanceAdapter();
    this.brapiAdapter = new BrapiAdapter();
  }

  /**
   * Fetch the current price for a ticker.
   * Tries cache first, then Yahoo Finance, then Brapi as fallback.
   * Returns null if all sources fail.
   */
  async fetchPrice(ticker: string): Promise<number | null> {
    const upperTicker = ticker.toUpperCase().trim();

    // Check cache first
    const cached = this.cache.get(upperTicker);
    if (cached) {
      return cached.preco;
    }

    // Try Yahoo Finance first
    const yahooResult = await this.yahooAdapter.fetchPrice(upperTicker);
    if (yahooResult.success && yahooResult.data) {
      this.cache.set(upperTicker, yahooResult.data.preco);
      return yahooResult.data.preco;
    }

    // Fallback to Brapi
    const brapiResult = await this.brapiAdapter.fetchPrice(upperTicker);
    if (brapiResult.success && brapiResult.data) {
      this.cache.set(upperTicker, brapiResult.data.preco);
      return brapiResult.data.preco;
    }

    // All sources failed
    return null;
  }

  /**
   * Fetch detailed quote data including source information.
   */
  async fetchQuote(ticker: string): Promise<QuoteResult> {
    const upperTicker = ticker.toUpperCase().trim();

    // Check cache first
    const cached = this.cache.get(upperTicker);
    if (cached) {
      return {
        success: true,
        data: {
          ticker: upperTicker,
          preco: cached.preco,
          fonte: 'cache',
          updatedAt: new Date(cached.updated_at),
        },
      };
    }

    // Try Yahoo Finance first
    const yahooResult = await this.yahooAdapter.fetchPrice(upperTicker);
    if (yahooResult.success && yahooResult.data) {
      this.cache.set(upperTicker, yahooResult.data.preco);
      return yahooResult;
    }

    // Fallback to Brapi
    const brapiResult = await this.brapiAdapter.fetchPrice(upperTicker);
    if (brapiResult.success && brapiResult.data) {
      this.cache.set(upperTicker, brapiResult.data.preco);
      return brapiResult;
    }

    // All sources failed - return Yahoo's error or a generic message
    return {
      success: false,
      error: yahooResult.error || brapiResult.error || 'Failed to fetch quote from all sources',
    };
  }

  /**
   * Set a manual price for a ticker (when APIs fail).
   */
  setManualPrice(ticker: string, preco: number): QuoteData {
    const upperTicker = ticker.toUpperCase().trim();
    
    if (preco <= 0) {
      throw new Error('Preço deve ser maior que zero');
    }

    this.cache.set(upperTicker, preco);

    return {
      ticker: upperTicker,
      preco: Number(preco.toFixed(2)),
      fonte: 'manual',
      updatedAt: new Date(),
    };
  }

  /**
   * Get cached price without fetching from APIs.
   */
  getCachedPrice(ticker: string): number | null {
    const upperTicker = ticker.toUpperCase().trim();
    const cached = this.cache.get(upperTicker);
    return cached ? cached.preco : null;
  }

  /**
   * Resolve the current price for a ticker (QuoteResolver interface implementation).
   * Returns the cached price if available, null otherwise.
   * This method satisfies the QuoteResolver interface for DashboardService injection.
   */
  resolve(ticker: string): number | null {
    return this.getCachedPrice(ticker);
  }

  /**
   * Check if cached price is expired for a ticker.
   */
  isCacheExpired(ticker: string): boolean {
    const upperTicker = ticker.toUpperCase().trim();
    return this.cache.isExpired(upperTicker);
  }

  /**
   * Clear cache for a specific ticker.
   */
  clearCache(ticker: string): void {
    const upperTicker = ticker.toUpperCase().trim();
    this.cache.clear(upperTicker);
  }

  /**
   * Clear all cached quotes.
   */
  clearAllCache(): void {
    this.cache.clearAll();
  }
}

export type { QuoteData, QuoteResult, QuoteResolver };
export { QuoteCache, YahooFinanceAdapter, BrapiAdapter };

import { QuoteResult, QuoteData } from '../types';

interface BrapiQuoteResponse {
  results?: Array<{
    symbol?: string;
    regularMarketPrice?: number;
    regularMarketPreviousClose?: number;
  }>;
}

export class BrapiAdapter {
  private baseUrl = 'https://brapi.dev/api/quote';

  formatTicker(ticker: string): string {
    // Brapi expects tickers without .SA suffix
    return ticker.toUpperCase().trim().replace(/\.SA$/i, '');
  }

  async fetchPrice(ticker: string): Promise<QuoteResult> {
    const formattedTicker = this.formatTicker(ticker);
    const url = `${this.baseUrl}/${formattedTicker}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Brapi API returned ${response.status}`,
        };
      }

      const data = (await response.json()) as BrapiQuoteResponse;

      if (!data.results || data.results.length === 0) {
        return {
          success: false,
          error: 'No results found in Brapi response',
        };
      }

      const result = data.results[0];
      let price: number | null = null;

      // Try regular market price first
      if (result.regularMarketPrice && result.regularMarketPrice > 0) {
        price = result.regularMarketPrice;
      }
      // Fallback to previous close
      else if (result.regularMarketPreviousClose && result.regularMarketPreviousClose > 0) {
        price = result.regularMarketPreviousClose;
      }

      if (price === null || price <= 0) {
        return {
          success: false,
          error: 'No valid price found in Brapi response',
        };
      }

      return {
        success: true,
        data: {
          ticker: ticker.toUpperCase(),
          preco: Number(price.toFixed(2)),
          fonte: 'brapi',
          updatedAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Brapi fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

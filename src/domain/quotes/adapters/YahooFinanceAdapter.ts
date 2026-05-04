import { QuoteResult, QuoteData } from '../types';

export class YahooFinanceAdapter {
  private baseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';

  formatTicker(ticker: string): string {
    // Brazilian stocks need .SA suffix for Yahoo Finance
    const cleanTicker = ticker.toUpperCase().trim();
    if (cleanTicker.endsWith('.SA')) {
      return cleanTicker;
    }
    return `${cleanTicker}.SA`;
  }

  async fetchPrice(ticker: string): Promise<QuoteResult> {
    const formattedTicker = this.formatTicker(ticker);
    const url = `${this.baseUrl}/${formattedTicker}?interval=1d&range=1d`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Yahoo Finance API returned ${response.status}`,
        };
      }

      const data = await response.json();

      // Extract price from response
      const result = data?.chart?.result?.[0];
      if (!result) {
        return {
          success: false,
          error: 'Invalid response format from Yahoo Finance',
        };
      }

      const meta = result.meta;
      const timestamps = result.timestamp;
      const closes = result.indicators?.quote?.[0]?.close;

      // Try to get current price from various sources in order of preference
      let price: number | null = null;

      // 1. Regular market price
      if (meta?.regularMarketPrice && meta.regularMarketPrice > 0) {
        price = meta.regularMarketPrice;
      }
      // 2. Previous close if market is closed
      else if (meta?.previousClose && meta.previousClose > 0) {
        price = meta.previousClose;
      }
      // 3. Last close price in the data
      else if (closes && closes.length > 0) {
        const lastClose = closes[closes.length - 1];
        if (lastClose && lastClose > 0) {
          price = lastClose;
        }
      }

      if (price === null || price <= 0) {
        return {
          success: false,
          error: 'No valid price found in Yahoo Finance response',
        };
      }

      return {
        success: true,
        data: {
          ticker: ticker.toUpperCase(),
          preco: Number(price.toFixed(2)),
          fonte: 'yahoo',
          updatedAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Yahoo Finance fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

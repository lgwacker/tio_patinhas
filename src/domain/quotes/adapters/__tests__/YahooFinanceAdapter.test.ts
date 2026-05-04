import { YahooFinanceAdapter } from '../YahooFinanceAdapter';

describe('YahooFinanceAdapter', () => {
  let adapter: YahooFinanceAdapter;

  beforeEach(() => {
    adapter = new YahooFinanceAdapter();
  });

  describe('formatTicker', () => {
    it('should add .SA suffix to Brazilian tickers', () => {
      expect(adapter.formatTicker('PETR4')).toBe('PETR4.SA');
      expect(adapter.formatTicker('vale3')).toBe('VALE3.SA');
    });

    it('should not add .SA suffix if already present', () => {
      expect(adapter.formatTicker('PETR4.SA')).toBe('PETR4.SA');
      expect(adapter.formatTicker('VALE3.sa')).toBe('VALE3.SA');
    });

    it('should trim whitespace from ticker', () => {
      expect(adapter.formatTicker('  PETR4  ')).toBe('PETR4.SA');
    });
  });

  describe('fetchPrice', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return successful result with price from regularMarketPrice', async () => {
      const mockResponse = {
        chart: {
          result: [{
            meta: {
              regularMarketPrice: 28.45,
              previousClose: 27.90,
            },
            timestamp: [1234567890],
            indicators: {
              quote: [{
                close: [28.45],
              }],
            },
          }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await adapter.fetchPrice('PETR4');

      expect(result.success).toBe(true);
      expect(result.data?.ticker).toBe('PETR4');
      expect(result.data?.preco).toBe(28.45);
      expect(result.data?.fonte).toBe('yahoo');
      expect(result.data?.updatedAt).toBeInstanceOf(Date);
    });

    it('should use previousClose when regularMarketPrice is not available', async () => {
      const mockResponse = {
        chart: {
          result: [{
            meta: {
              regularMarketPrice: null,
              previousClose: 27.90,
            },
            timestamp: [1234567890],
            indicators: {
              quote: [{
                close: [27.90],
              }],
            },
          }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await adapter.fetchPrice('PETR4');

      expect(result.success).toBe(true);
      expect(result.data?.preco).toBe(27.90);
    });

    it('should use last close price when meta prices are not available', async () => {
      const mockResponse = {
        chart: {
          result: [{
            meta: {},
            timestamp: [1234567890, 1234567900],
            indicators: {
              quote: [{
                close: [27.50, 28.00],
              }],
            },
          }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await adapter.fetchPrice('PETR4');

      expect(result.success).toBe(true);
      expect(result.data?.preco).toBe(28.00);
    });

    it('should return error when API returns non-ok response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await adapter.fetchPrice('INVALID');

      expect(result.success).toBe(false);
      expect(result.error).toContain('404');
    });

    it('should return error when response format is invalid', async () => {
      const mockResponse = {
        chart: {
          result: [],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await adapter.fetchPrice('PETR4');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid response format');
    });

    it('should return error when no valid price is found', async () => {
      const mockResponse = {
        chart: {
          result: [{
            meta: {
              regularMarketPrice: 0,
            },
            timestamp: [],
            indicators: {
              quote: [{}],
            },
          }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await adapter.fetchPrice('PETR4');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No valid price found');
    });

    it('should handle fetch errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await adapter.fetchPrice('PETR4');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should format ticker correctly in API URL', async () => {
      const mockResponse = {
        chart: {
          result: [{
            meta: { regularMarketPrice: 25.0 },
            timestamp: [1234567890],
            indicators: { quote: [{ close: [25.0] }] },
          }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await adapter.fetchPrice('VALE3');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('VALE3.SA'),
        expect.any(Object)
      );
    });
  });
});

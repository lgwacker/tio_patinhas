import { BrapiAdapter } from '../BrapiAdapter';

describe('BrapiAdapter', () => {
  let adapter: BrapiAdapter;

  beforeEach(() => {
    adapter = new BrapiAdapter();
  });

  describe('formatTicker', () => {
    it('should return ticker without .SA suffix', () => {
      expect(adapter.formatTicker('PETR4')).toBe('PETR4');
      expect(adapter.formatTicker('VALE3')).toBe('VALE3');
    });

    it('should remove .SA suffix if present', () => {
      expect(adapter.formatTicker('PETR4.SA')).toBe('PETR4');
      expect(adapter.formatTicker('VALE3.sa')).toBe('VALE3');
    });

    it('should convert to uppercase', () => {
      expect(adapter.formatTicker('petr4')).toBe('PETR4');
    });

    it('should trim whitespace from ticker', () => {
      expect(adapter.formatTicker('  PETR4  ')).toBe('PETR4');
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
        results: [{
          symbol: 'PETR4',
          regularMarketPrice: 28.45,
          regularMarketPreviousClose: 27.90,
        }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await adapter.fetchPrice('PETR4');

      expect(result.success).toBe(true);
      expect(result.data?.ticker).toBe('PETR4');
      expect(result.data?.preco).toBe(28.45);
      expect(result.data?.fonte).toBe('brapi');
      expect(result.data?.updatedAt).toBeInstanceOf(Date);
    });

    it('should use previousClose when regularMarketPrice is not available', async () => {
      const mockResponse = {
        results: [{
          symbol: 'PETR4',
          regularMarketPreviousClose: 27.90,
        }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await adapter.fetchPrice('PETR4');

      expect(result.success).toBe(true);
      expect(result.data?.preco).toBe(27.90);
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

    it('should return error when results array is empty', async () => {
      const mockResponse = {
        results: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await adapter.fetchPrice('INVALID');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No results found');
    });

    it('should return error when results is undefined', async () => {
      const mockResponse = {};

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await adapter.fetchPrice('INVALID');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No results found');
    });

    it('should return error when no valid price is found', async () => {
      const mockResponse = {
        results: [{
          symbol: 'PETR4',
          regularMarketPrice: 0,
        }],
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
        results: [{
          symbol: 'VALE3',
          regularMarketPrice: 65.0,
        }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await adapter.fetchPrice('VALE3.SA');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/VALE3'),
        expect.any(Object)
      );
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('.SA'),
        expect.any(Object)
      );
    });
  });
});

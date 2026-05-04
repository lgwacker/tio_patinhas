import Database from 'better-sqlite3';
import { QuotesService } from '../QuotesService';
import { MigrationRunner } from '@/data/MigrationRunner';

describe('QuotesService', () => {
  let db: Database.Database;
  let service: QuotesService;

  beforeEach(() => {
    db = new Database(':memory:');
    const migrations = new MigrationRunner(db);
    migrations.runMigrations();
    service = new QuotesService(db, { cacheTtlMinutes: 15 });
  });

  afterEach(() => {
    db.close();
  });

  describe('fetchPrice', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return price from Yahoo Finance when available', async () => {
      const mockResponse = {
        chart: {
          result: [{
            meta: { regularMarketPrice: 28.45 },
            timestamp: [1234567890],
            indicators: { quote: [{ close: [28.45] }] },
          }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const price = await service.fetchPrice('PETR4');

      expect(price).toBe(28.45);
    });

    it('should fallback to Brapi when Yahoo Finance fails', async () => {
      // Yahoo Finance fails
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      // Brapi succeeds
      const brapiResponse = {
        results: [{
          symbol: 'PETR4',
          regularMarketPrice: 28.50,
        }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => brapiResponse,
      });

      const price = await service.fetchPrice('PETR4');

      expect(price).toBe(28.50);
    });

    it('should return cached price without calling APIs', async () => {
      // First call - fetch from API
      const mockResponse = {
        chart: {
          result: [{
            meta: { regularMarketPrice: 28.45 },
            timestamp: [1234567890],
            indicators: { quote: [{ close: [28.45] }] },
          }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await service.fetchPrice('PETR4');

      // Second call - should use cache
      const price = await service.fetchPrice('PETR4');

      expect(price).toBe(28.45);
      expect(global.fetch).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should return null when both APIs fail', async () => {
      // Both APIs fail
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const price = await service.fetchPrice('INVALID');

      expect(price).toBeNull();
    });

    it('should normalize ticker to uppercase', async () => {
      const mockResponse = {
        chart: {
          result: [{
            meta: { regularMarketPrice: 28.45 },
            timestamp: [1234567890],
            indicators: { quote: [{ close: [28.45] }] },
          }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await service.fetchPrice('petr4');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('PETR4.SA'),
        expect.any(Object)
      );
    });

    it('should trim whitespace from ticker', async () => {
      const mockResponse = {
        chart: {
          result: [{
            meta: { regularMarketPrice: 28.45 },
            timestamp: [1234567890],
            indicators: { quote: [{ close: [28.45] }] },
          }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await service.fetchPrice('  PETR4  ');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('PETR4.SA'),
        expect.any(Object)
      );
    });
  });

  describe('fetchQuote', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return successful result with detailed quote data', async () => {
      const mockResponse = {
        chart: {
          result: [{
            meta: { regularMarketPrice: 28.45 },
            timestamp: [1234567890],
            indicators: { quote: [{ close: [28.45] }] },
          }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.fetchQuote('PETR4');

      expect(result.success).toBe(true);
      expect(result.data?.ticker).toBe('PETR4');
      expect(result.data?.preco).toBe(28.45);
      expect(result.data?.fonte).toBe('yahoo');
      expect(result.data?.updatedAt).toBeInstanceOf(Date);
    });

    it('should return cached result with cache source', async () => {
      // First call - fetch from API
      const mockResponse = {
        chart: {
          result: [{
            meta: { regularMarketPrice: 28.45 },
            timestamp: [1234567890],
            indicators: { quote: [{ close: [28.45] }] },
          }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await service.fetchQuote('PETR4');

      // Second call - should return from cache
      const result = await service.fetchQuote('PETR4');

      expect(result.success).toBe(true);
      expect(result.data?.fonte).toBe('cache');
    });

    it('should return error result when all APIs fail', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.fetchQuote('INVALID');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('setManualPrice', () => {
    it('should store manual price in cache', () => {
      const result = service.setManualPrice('PETR4', 30.00);

      expect(result.ticker).toBe('PETR4');
      expect(result.preco).toBe(30.00);
      expect(result.fonte).toBe('manual');
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should round price to 2 decimal places', () => {
      const result = service.setManualPrice('PETR4', 30.999);

      expect(result.preco).toBe(31.00);
    });

    it('should normalize ticker to uppercase', () => {
      const result = service.setManualPrice('petr4', 30.00);

      expect(result.ticker).toBe('PETR4');
    });

    it('should throw error for price <= 0', () => {
      expect(() => service.setManualPrice('PETR4', 0)).toThrow('Preço deve ser maior que zero');
      expect(() => service.setManualPrice('PETR4', -10)).toThrow('Preço deve ser maior que zero');
    });

    it('should be retrievable via getCachedPrice', () => {
      service.setManualPrice('PETR4', 30.00);

      const cached = service.getCachedPrice('PETR4');
      expect(cached).toBe(30.00);
    });
  });

  describe('getCachedPrice', () => {
    it('should return null when no cached price exists', () => {
      const price = service.getCachedPrice('NONEXISTENT');
      expect(price).toBeNull();
    });

    it('should return cached price after fetch', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          chart: {
            result: [{
              meta: { regularMarketPrice: 28.45 },
              timestamp: [1234567890],
              indicators: { quote: [{ close: [28.45] }] },
            }],
          },
        }),
      });

      await service.fetchPrice('PETR4');

      const cached = service.getCachedPrice('PETR4');
      expect(cached).toBe(28.45);
    });
  });

  describe('isCacheExpired', () => {
    it('should return true when no cache exists', () => {
      expect(service.isCacheExpired('NONEXISTENT')).toBe(true);
    });

    it('should return false for fresh cache', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          chart: {
            result: [{
              meta: { regularMarketPrice: 28.45 },
              timestamp: [1234567890],
              indicators: { quote: [{ close: [28.45] }] },
            }],
          },
        }),
      });

      await service.fetchPrice('PETR4');

      expect(service.isCacheExpired('PETR4')).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('should clear cache for specific ticker', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          chart: {
            result: [{
              meta: { regularMarketPrice: 28.45 },
              timestamp: [1234567890],
              indicators: { quote: [{ close: [28.45] }] },
            }],
          },
        }),
      });

      await service.fetchPrice('PETR4');
      service.clearCache('PETR4');

      expect(service.getCachedPrice('PETR4')).toBeNull();
    });
  });

  describe('clearAllCache', () => {
    it('should clear all cached prices', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          chart: {
            result: [{
              meta: { regularMarketPrice: 28.45 },
              timestamp: [1234567890],
              indicators: { quote: [{ close: [28.45] }] },
            }],
          },
        }),
      });

      await service.fetchPrice('PETR4');
      service.setManualPrice('VALE3', 65.00);

      service.clearAllCache();

      expect(service.getCachedPrice('PETR4')).toBeNull();
      expect(service.getCachedPrice('VALE3')).toBeNull();
    });
  });

  describe('configuration', () => {
    it('should use custom cache TTL', () => {
      const customService = new QuotesService(db, { cacheTtlMinutes: 60 });
      
      customService.setManualPrice('PETR4', 30.00);
      expect(customService.getCachedPrice('PETR4')).toBe(30.00);
    });

    it('should use default cache TTL when not specified', () => {
      const defaultService = new QuotesService(db);
      
      defaultService.setManualPrice('PETR4', 30.00);
      expect(defaultService.getCachedPrice('PETR4')).toBe(30.00);
    });
  });
});

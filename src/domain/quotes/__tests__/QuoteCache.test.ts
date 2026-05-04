import Database from 'better-sqlite3';
import { QuoteCache } from '../QuoteCache';
import { MigrationRunner } from '@/data/MigrationRunner';

describe('QuoteCache', () => {
  let db: Database.Database;
  let cache: QuoteCache;

  beforeEach(() => {
    db = new Database(':memory:');
    const migrations = new MigrationRunner(db);
    migrations.runMigrations();
    cache = new QuoteCache(db, 15); // 15 minutes TTL
  });

  afterEach(() => {
    db.close();
  });

  describe('set', () => {
    it('should store a quote in the cache', () => {
      cache.set('PETR4', 28.45);

      const result = cache.get('PETR4');
      expect(result).not.toBeNull();
      expect(result?.ticker).toBe('PETR4');
      expect(result?.preco).toBe(28.45);
    });

    it('should update an existing quote', () => {
      cache.set('PETR4', 28.45);
      cache.set('PETR4', 30.00);

      const result = cache.get('PETR4');
      expect(result?.preco).toBe(30.00);
    });
  });

  describe('get', () => {
    it('should return null for non-existent ticker', () => {
      const result = cache.get('NONEXISTENT');
      expect(result).toBeNull();
    });

    it('should return cached quote within TTL', () => {
      cache.set('PETR4', 28.45);

      const result = cache.get('PETR4');
      expect(result).not.toBeNull();
      expect(result?.preco).toBe(28.45);
    });

    it('should return null for expired cache entry', () => {
      // Create cache with 0 TTL (everything expires immediately)
      const expiredCache = new QuoteCache(db, 0);
      expiredCache.set('PETR4', 28.45);

      // Small delay to ensure expiration
      const result = expiredCache.get('PETR4');
      expect(result).toBeNull();
    });

    it('should return different prices for different tickers', () => {
      cache.set('PETR4', 28.45);
      cache.set('VALE3', 65.20);

      const petr = cache.get('PETR4');
      const vale = cache.get('VALE3');

      expect(petr?.preco).toBe(28.45);
      expect(vale?.preco).toBe(65.20);
    });
  });

  describe('isExpired', () => {
    it('should return true for non-existent ticker', () => {
      expect(cache.isExpired('NONEXISTENT')).toBe(true);
    });

    it('should return false for valid cache entry', () => {
      cache.set('PETR4', 28.45);
      expect(cache.isExpired('PETR4')).toBe(false);
    });

    it('should return true for expired cache entry', () => {
      const expiredCache = new QuoteCache(db, 0);
      expiredCache.set('PETR4', 28.45);
      expect(expiredCache.isExpired('PETR4')).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove a specific ticker from cache', () => {
      cache.set('PETR4', 28.45);
      cache.set('VALE3', 65.20);

      cache.clear('PETR4');

      expect(cache.get('PETR4')).toBeNull();
      expect(cache.get('VALE3')).not.toBeNull();
    });

    it('should not throw when clearing non-existent ticker', () => {
      expect(() => cache.clear('NONEXISTENT')).not.toThrow();
    });
  });

  describe('clearAll', () => {
    it('should remove all entries from cache', () => {
      cache.set('PETR4', 28.45);
      cache.set('VALE3', 65.20);
      cache.set('ITUB4', 30.00);

      cache.clearAll();

      expect(cache.get('PETR4')).toBeNull();
      expect(cache.get('VALE3')).toBeNull();
      expect(cache.get('ITUB4')).toBeNull();
    });

    it('should not throw when cache is empty', () => {
      expect(() => cache.clearAll()).not.toThrow();
    });
  });

  describe('TTL configuration', () => {
    it('should use custom TTL', () => {
      // Create cache with very long TTL
      const longCache = new QuoteCache(db, 1440); // 24 hours
      longCache.set('PETR4', 28.45);

      expect(longCache.isExpired('PETR4')).toBe(false);
    });

    it('should use default TTL when not specified', () => {
      const defaultCache = new QuoteCache(db);
      defaultCache.set('PETR4', 28.45);

      expect(defaultCache.get('PETR4')).not.toBeNull();
    });
  });
});

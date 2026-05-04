import Database from 'better-sqlite3';
import { QuoteCacheEntry } from './types';

export class QuoteCache {
  private db: Database.Database;
  private readonly cacheTtlMinutes: number;

  constructor(db: Database.Database, cacheTtlMinutes: number = 15) {
    this.db = db;
    this.cacheTtlMinutes = cacheTtlMinutes;
  }

  get(ticker: string): QuoteCacheEntry | null {
    const row = this.db
      .prepare(
        `SELECT ticker, preco, updated_at 
         FROM quotes 
         WHERE ticker = ? 
         AND datetime(updated_at) > datetime('now', '-${this.cacheTtlMinutes} minutes')`
      )
      .get(ticker) as Record<string, unknown> | undefined;

    if (!row) return null;

    return {
      ticker: row.ticker as string,
      preco: row.preco as number,
      updated_at: row.updated_at as string,
    };
  }

  set(ticker: string, preco: number): void {
    this.db
      .prepare(
        `INSERT INTO quotes (ticker, preco) 
         VALUES (?, ?) 
         ON CONFLICT(ticker) DO UPDATE SET 
           preco = excluded.preco,
           updated_at = CURRENT_TIMESTAMP`
      )
      .run(ticker, preco);
  }

  isExpired(ticker: string): boolean {
    const cached = this.get(ticker);
    return !cached;
  }

  clear(ticker: string): void {
    this.db.prepare('DELETE FROM quotes WHERE ticker = ?').run(ticker);
  }

  clearAll(): void {
    this.db.prepare('DELETE FROM quotes').run();
  }
}

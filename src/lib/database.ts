import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { DatabaseModule } from '@/data/DatabaseModule';
import { MigrationRunner } from '@/data/MigrationRunner';
import { PositionModule } from '@/domain/position/PositionModule';
import { QuotesService } from '@/domain/quotes';

const dbPath = process.env.DATABASE_PATH || './data/tiopatinhas.db';

let db: Database.Database | null = null;
let dbModule: DatabaseModule | null = null;
let positionModule: PositionModule | null = null;
let quoteService: QuotesService | null = null;

/**
 * Ensures the data directory exists before opening the database.
 * Skips for in-memory databases (used in tests).
 */
function ensureDataDirectory(databasePath: string): void {
  if (databasePath.includes(':memory:')) {
    return;
  }

  const dir = path.dirname(databasePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getDatabase(): Database.Database {
  if (!db) {
    ensureDataDirectory(dbPath);
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    
    // Run migrations
    const migrationRunner = new MigrationRunner(db);
    migrationRunner.runMigrations();
  }
  return db;
}

export function getDatabaseModule(): DatabaseModule {
  if (!dbModule) {
    dbModule = new DatabaseModule(getDatabase());
  }
  return dbModule;
}

export function getPositionModule(): PositionModule {
  if (!positionModule) {
    positionModule = new PositionModule(getDatabaseModule());
  }
  return positionModule;
}

export function getQuoteService(): QuotesService {
  if (!quoteService) {
    quoteService = new QuotesService(getDatabase(), {
      cacheTtlMinutes: 15,
    });
  }
  return quoteService;
}

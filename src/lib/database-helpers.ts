import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { MigrationRunner } from '@/data/MigrationRunner';

const dbPath = process.env.DATABASE_PATH || './data/tiopatinhas.db';

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

/**
 * Creates a database connection with migrations run.
 * Ensures data directory exists for file-based databases.
 */
export function createDatabase(): Database.Database {
  ensureDataDirectory(dbPath);
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Run migrations
  const migrationRunner = new MigrationRunner(db);
  migrationRunner.runMigrations();

  return db;
}

/**
 * Gets the database path (for tests that need it).
 */
export function getDatabasePath(): string {
  return dbPath;
}

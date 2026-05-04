import Database from 'better-sqlite3';
import { DatabaseModule } from '@/data/DatabaseModule';
import { MigrationRunner } from '@/data/MigrationRunner';
import { PositionModule } from '@/domain/position/PositionModule';
import { QuotesService } from '@/domain/quotes/QuotesService';

/**
 * Test helper that creates a fresh in-memory database setup.
 * Each call creates an isolated database environment for parallel-safe tests.
 */
export function createTestDatabase(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  
  // Run migrations
  const migrationRunner = new MigrationRunner(db);
  migrationRunner.runMigrations();
  
  return db;
}

export function createTestDatabaseModule(): DatabaseModule {
  const db = createTestDatabase();
  return new DatabaseModule(db);
}

export function createTestPositionModule(): PositionModule {
  const dbModule = createTestDatabaseModule();
  return new PositionModule(dbModule);
}

export function createTestQuotesService(): QuotesService {
  const db = createTestDatabase();
  return new QuotesService(db, { cacheTtlMinutes: 15 });
}

import Database from 'better-sqlite3';
import { DatabaseModule } from '@/data/DatabaseModule';
import { MigrationRunner } from '@/data/MigrationRunner';
import { PositionModule } from '@/domain/position/PositionModule';

const dbPath = process.env.DATABASE_PATH || './data/tiopatinhas.db';

let db: Database.Database | null = null;
let dbModule: DatabaseModule | null = null;
let positionModule: PositionModule | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
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

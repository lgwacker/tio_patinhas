import { DatabaseModule } from '@/data/DatabaseModule';
import { PositionModule } from '@/domain/position/PositionModule';
import { QuotesService } from '@/domain/quotes';
import { createDatabase } from './database-helpers';

/**
 * Composition root factory functions.
 *
 * These functions explicitly wire dependencies at the composition root level.
 * Each call creates fresh instances, ensuring proper isolation between requests.
 *
 * This approach replaces the service locator anti-pattern with explicit
 * dependency injection while keeping composition logic centralized.
 */

export function createPositionModule(): PositionModule {
  const db = createDatabase();
  const dbModule = new DatabaseModule(db);
  return new PositionModule(dbModule);
}

export function createQuotesService(): QuotesService {
  const db = createDatabase();
  return new QuotesService(db, { cacheTtlMinutes: 15 });
}

export function createDashboardDependencies(): {
  dataModule: DatabaseModule;
  quotesService: QuotesService;
} {
  const db = createDatabase();
  return {
    dataModule: new DatabaseModule(db),
    quotesService: new QuotesService(db, { cacheTtlMinutes: 15 }),
  };
}

export function createHistoricoDependencies(): {
  dbModule: DatabaseModule;
} {
  const db = createDatabase();
  return {
    dbModule: new DatabaseModule(db),
  };
}

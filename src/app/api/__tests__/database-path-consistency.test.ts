import fs from 'fs';
import path from 'path';

const DB_PATH_REGEX = /process\.env\.(\w+)\s*\|\|\s*['"`]([^'"`]+)['"`]/;

function readSourceFile(relativePath: string): string {
  return fs.readFileSync(path.join(__dirname, relativePath), 'utf-8');
}

function extractDatabasePath(fileContent: string): string | null {
  const match = fileContent.match(DB_PATH_REGEX);
  return match?.[2] ?? null;
}

describe('Database path consistency', () => {
  it('should define database path only in database.ts', () => {
    const databasePathFile = readSourceFile('../../../lib/database.ts');
    const dashboardRouteFile = readSourceFile('../dashboard/route.ts');

    const databaseTsPath = extractDatabasePath(databasePathFile);
    const dashboardRoutePath = extractDatabasePath(dashboardRouteFile);

    expect(databaseTsPath).toBeTruthy();
    expect(databaseTsPath).toContain('tiopatinhas.db');
    expect(databaseTsPath).not.toContain('tio_patinhas.db');

    // Dashboard route should not define its own path - it imports from database.ts
    expect(dashboardRoutePath).toBeNull();
  });

  it('should use getDatabase import from lib/database in dashboard route', () => {
    const dashboardRouteFile = readSourceFile('../dashboard/route.ts');

    expect(dashboardRouteFile).toContain("from '@/lib/database'");
    expect(dashboardRouteFile).toContain('getDatabase');
  });

  it('should use DATABASE_PATH environment variable in database.ts', () => {
    const databasePathFile = readSourceFile('../../../lib/database.ts');

    expect(databasePathFile).toContain('process.env.DATABASE_PATH');
    expect(databasePathFile).not.toContain('process.env.DB_PATH');
  });
});

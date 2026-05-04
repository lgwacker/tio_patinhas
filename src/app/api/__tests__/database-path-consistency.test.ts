import fs from 'fs';
import path from 'path';

describe('Database path consistency', () => {
  it('should use the same database path in all modules', () => {
    // Read the database.ts file
    const databasePathFile = fs.readFileSync(
      path.join(__dirname, '../../../lib/database.ts'),
      'utf-8'
    );

    // Read the dashboard route file
    const dashboardRouteFile = fs.readFileSync(
      path.join(__dirname, '../dashboard/route.ts'),
      'utf-8'
    );

    // Extract the database path from database.ts
    const dbPathMatch = databasePathFile.match(
      /process\.env\.(\w+)\s*\|\|\s*['"`]([^'"`]+)['"`]/
    );
    expect(dbPathMatch).toBeTruthy();
    const databaseTsPath = dbPathMatch![2];

    // Extract the database path from dashboard route
    const dashboardPathMatch = dashboardRouteFile.match(
      /process\.env\.(\w+)\s*\|\|\s*['"`]([^'"`]+)['"`]/
    );
    expect(dashboardPathMatch).toBeTruthy();
    const dashboardRoutePath = dashboardPathMatch![2];

    // Both should use the same database file path
    expect(dashboardRoutePath).toBe(databaseTsPath);
  });

  it('should use tiopatinhas.db without underscore', () => {
    // Read the dashboard route file
    const dashboardRouteFile = fs.readFileSync(
      path.join(__dirname, '../dashboard/route.ts'),
      'utf-8'
    );

    // Extract the database path
    const pathMatch = dashboardRouteFile.match(
      /process\.env\.(\w+)\s*\|\|\s*['"`]([^'"`]+)['"`]/
    );
    expect(pathMatch).toBeTruthy();
    const dbPath = pathMatch![2];

    // Should use 'tiopatinhas.db' (without underscore)
    expect(dbPath).toContain('tiopatinhas.db');
    expect(dbPath).not.toContain('tio_patinhas.db');
  });

  it('should use DATABASE_PATH environment variable consistently', () => {
    // Read the dashboard route file
    const dashboardRouteFile = fs.readFileSync(
      path.join(__dirname, '../dashboard/route.ts'),
      'utf-8'
    );

    // Extract the environment variable name
    const envVarMatch = dashboardRouteFile.match(
      /process\.env\.(\w+)\s*\|\|\s*['"`]/
    );
    expect(envVarMatch).toBeTruthy();
    const envVarName = envVarMatch![1];

    // Should use 'DATABASE_PATH' (not 'DB_PATH')
    expect(envVarName).toBe('DATABASE_PATH');
  });
});

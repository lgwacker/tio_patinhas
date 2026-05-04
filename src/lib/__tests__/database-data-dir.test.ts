import fs from 'fs';
import path from 'path';

// Helper to reset the database module singletons between tests
function resetDatabaseModule() {
  jest.resetModules();
}

// Helper to get a fresh database instance
async function getFreshDatabase(dbPath: string) {
  process.env.DATABASE_PATH = dbPath;
  const { getDatabase } = await import('../database');
  return getDatabase();
}

describe('Database data directory', () => {
  const testDataDir = './test-data-dir';
  const originalEnv = process.env.DATABASE_PATH;

  beforeEach(() => {
    resetDatabaseModule();
  });

  afterEach(() => {
    // Cleanup: remove test data directory if it exists
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
    // Restore original env
    process.env.DATABASE_PATH = originalEnv;
  });

  it('should create data directory when it does not exist', async () => {
    // Ensure directory doesn't exist initially
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }

    // Set database path to use test directory
    const dbPath = path.join(testDataDir, 'test.db');

    // This should create the directory and not throw
    const db = await getFreshDatabase(dbPath);

    // Verify directory was created
    expect(fs.existsSync(testDataDir)).toBe(true);
    expect(fs.existsSync(dbPath)).toBe(true);

    db.close();
  });

  it('should work when data directory already exists', async () => {
    // Create directory beforehand
    fs.mkdirSync(testDataDir, { recursive: true });

    const dbPath = path.join(testDataDir, 'test.db');

    // This should work without errors
    const db = await getFreshDatabase(dbPath);

    expect(fs.existsSync(dbPath)).toBe(true);

    db.close();
  });

  it('should create nested data directories if needed', async () => {
    const nestedDir = path.join(testDataDir, 'nested', 'deep');
    const dbPath = path.join(nestedDir, 'test.db');

    // This should create all nested directories
    const db = await getFreshDatabase(dbPath);

    // Verify all nested directories were created
    expect(fs.existsSync(testDataDir)).toBe(true);
    expect(fs.existsSync(path.join(testDataDir, 'nested'))).toBe(true);
    expect(fs.existsSync(nestedDir)).toBe(true);
    expect(fs.existsSync(dbPath)).toBe(true);

    db.close();
  });
});

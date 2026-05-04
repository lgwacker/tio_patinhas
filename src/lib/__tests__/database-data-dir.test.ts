import fs from 'fs';
import path from 'path';

async function getFreshDatabase(dbPath: string) {
  jest.resetModules();
  process.env.DATABASE_PATH = dbPath;
  const { getDatabase } = await import('../database');
  return getDatabase();
}

describe('Database data directory', () => {
  const testDataDir = './test-data-dir';
  const originalEnv = process.env.DATABASE_PATH;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
    process.env.DATABASE_PATH = originalEnv;
  });

  it('should create data directory when it does not exist', async () => {
    const dbPath = path.join(testDataDir, 'test.db');

    const db = await getFreshDatabase(dbPath);

    expect(fs.existsSync(testDataDir)).toBe(true);
    expect(fs.existsSync(dbPath)).toBe(true);

    db.close();
  });

  it('should work when data directory already exists', async () => {
    fs.mkdirSync(testDataDir, { recursive: true });

    const dbPath = path.join(testDataDir, 'test.db');
    const db = await getFreshDatabase(dbPath);

    expect(fs.existsSync(dbPath)).toBe(true);

    db.close();
  });

  it('should create nested data directories if needed', async () => {
    const nestedDir = path.join(testDataDir, 'nested', 'deep');
    const dbPath = path.join(nestedDir, 'test.db');

    const db = await getFreshDatabase(dbPath);

    expect(fs.existsSync(testDataDir)).toBe(true);
    expect(fs.existsSync(path.join(testDataDir, 'nested'))).toBe(true);
    expect(fs.existsSync(nestedDir)).toBe(true);
    expect(fs.existsSync(dbPath)).toBe(true);

    db.close();
  });
});

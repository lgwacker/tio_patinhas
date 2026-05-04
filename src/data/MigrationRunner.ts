import type Database from 'better-sqlite3';

export class MigrationRunner {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  runMigrations(): void {
    // Create migrations tracking table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Run each migration if not already applied
    const migrations = this.getMigrations();
    
    for (const migration of migrations) {
      const exists = this.db.prepare('SELECT 1 FROM migrations WHERE name = ?').get(migration.name);
      if (!exists) {
        migration.up(this.db);
        this.db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migration.name);
      }
    }
  }

  private getMigrations(): Array<{ name: string; up: (db: Database.Database) => void }> {
    return [
      {
        name: '001_create_positions_table',
        up: (db) => {
          db.exec(`
            CREATE TABLE IF NOT EXISTS positions (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              ticker TEXT NOT NULL UNIQUE,
              nome TEXT NOT NULL,
              classe_ativo TEXT NOT NULL,
              setor TEXT,
              segmento TEXT,
              quantidade INTEGER NOT NULL DEFAULT 0,
              preco_medio REAL NOT NULL DEFAULT 0,
              data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);
          db.exec('CREATE INDEX IF NOT EXISTS idx_positions_ticker ON positions(ticker)');
          db.exec('CREATE INDEX IF NOT EXISTS idx_positions_classe ON positions(classe_ativo)');
        },
      },
      {
        name: '002_create_operations_table',
        up: (db) => {
          db.exec(`
            CREATE TABLE IF NOT EXISTS operations (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              position_id INTEGER NOT NULL,
              tipo TEXT NOT NULL CHECK (tipo IN ('compra', 'venda')),
              data TEXT NOT NULL,
              quantidade INTEGER NOT NULL,
              valor_total REAL NOT NULL,
              preco_unitario REAL NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE
            )
          `);
          db.exec('CREATE INDEX IF NOT EXISTS idx_operations_position ON operations(position_id)');
          db.exec('CREATE INDEX IF NOT EXISTS idx_operations_data ON operations(data)');
        },
      },
      {
        name: '003_create_config_table',
        up: (db) => {
          db.exec(`
            CREATE TABLE IF NOT EXISTS config (
              chave TEXT PRIMARY KEY,
              valor TEXT NOT NULL,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);
        },
      },
      {
        name: '004_create_quotes_table',
        up: (db) => {
          db.exec(`
            CREATE TABLE IF NOT EXISTS quotes (
              ticker TEXT PRIMARY KEY,
              preco REAL NOT NULL,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);
          db.exec('CREATE INDEX IF NOT EXISTS idx_quotes_ticker ON quotes(ticker)');
        },
      },
    ];
  }
}

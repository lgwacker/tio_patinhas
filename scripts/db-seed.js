#!/usr/bin/env node
/**
 * Seed the database with rich test data covering all app features.
 * Usage: node scripts/db-seed.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../data/tiopatinhas.db');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log(`🌱 Connecting to database: ${dbPath}`);
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Run migrations inline (avoid TS import issues)
console.log('🔧 Running migrations...');
db.exec(`
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const migrationNames = [
  '001_create_positions_table',
  '002_create_operations_table',
  '003_create_config_table',
  '004_create_quotes_table',
];

for (const name of migrationNames) {
  const exists = db.prepare('SELECT 1 FROM migrations WHERE name = ?').get(name);
  if (!exists) {
    if (name === '001_create_positions_table') {
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
    } else if (name === '002_create_operations_table') {
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
    } else if (name === '003_create_config_table') {
      db.exec(`
        CREATE TABLE IF NOT EXISTS config (
          chave TEXT PRIMARY KEY,
          valor TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else if (name === '004_create_quotes_table') {
      db.exec(`
        CREATE TABLE IF NOT EXISTS quotes (
          ticker TEXT PRIMARY KEY,
          preco REAL NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      db.exec('CREATE INDEX IF NOT EXISTS idx_quotes_ticker ON quotes(ticker)');
    }
    db.prepare('INSERT INTO migrations (name) VALUES (?)').run(name);
  }
}

// Clear existing data
console.log('🧹 Clearing existing data...');
db.exec('DELETE FROM operations');
db.exec('DELETE FROM quotes');
db.exec('DELETE FROM config');
db.exec('DELETE FROM positions');

// Seed positions
const positions = [
  {
    ticker: 'PETR4',
    nome: 'Petrobras PN',
    classe_ativo: 'acao',
    setor: 'Energia',
    segmento: 'Petróleo e Gás',
    operations: [
      { tipo: 'compra', data: '2024-01-15', quantidade: 100, valor_total: 2500.00 },
      { tipo: 'compra', data: '2024-03-10', quantidade: 50, valor_total: 1500.00 },
    ],
  },
  {
    ticker: 'VALE3',
    nome: 'Vale SA',
    classe_ativo: 'acao',
    setor: 'Materiais Básicos',
    segmento: 'Mineração',
    operations: [
      { tipo: 'compra', data: '2024-02-01', quantidade: 80, valor_total: 5200.00 },
      { tipo: 'compra', data: '2024-04-20', quantidade: 20, valor_total: 1400.00 },
    ],
  },
  {
    ticker: 'HGLG11',
    nome: 'CSHG Logística FII',
    classe_ativo: 'fundo_imobiliario',
    setor: 'Logística',
    segmento: 'Galpões Industriais',
    operations: [
      { tipo: 'compra', data: '2024-01-20', quantidade: 200, valor_total: 3700.00 },
    ],
  },
  {
    ticker: 'ABCD3',
    nome: 'Fake Company Ltda',
    classe_ativo: 'acao',
    setor: 'Tecnologia',
    segmento: 'Software',
    operations: [
      { tipo: 'compra', data: '2026-05-04', quantidade: 10, valor_total: 1000.00 },
    ],
  },
  {
    ticker: 'TEST99',
    nome: 'Tesouro IPCA+ 2035',
    classe_ativo: 'renda_fixa',
    setor: 'Governo',
    segmento: 'Tesouro Direto',
    operations: [
      { tipo: 'compra', data: '2024-05-01', quantidade: 50, valor_total: 25000.00 },
    ],
  },
  {
    ticker: 'BTCETF',
    nome: 'Bitcoin ETF',
    classe_ativo: 'etf',
    setor: 'Criptomoedas',
    segmento: 'Bitcoin',
    operations: [
      { tipo: 'compra', data: '2024-06-15', quantidade: 30, valor_total: 1350.00 },
    ],
  },
];

const insertPosition = db.prepare(`
  INSERT INTO positions (ticker, nome, classe_ativo, setor, segmento, quantidade, preco_medio)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertOperation = db.prepare(`
  INSERT INTO operations (position_id, tipo, data, quantidade, valor_total, preco_unitario)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertQuote = db.prepare(`
  INSERT INTO quotes (ticker, preco) VALUES (?, ?)
  ON CONFLICT(ticker) DO UPDATE SET preco = excluded.preco, updated_at = CURRENT_TIMESTAMP
`);

console.log('📦 Inserting positions and operations...');

for (const pos of positions) {
  const totalQty = pos.operations.reduce((sum, op) => sum + op.quantidade, 0);
  const totalValue = pos.operations.reduce((sum, op) => sum + op.valor_total, 0);
  const avgPrice = totalValue / totalQty;

  const posResult = insertPosition.run(
    pos.ticker,
    pos.nome,
    pos.classe_ativo,
    pos.setor,
    pos.segmento,
    totalQty,
    avgPrice
  );

  const positionId = posResult.lastInsertRowid;

  for (const op of pos.operations) {
    const unitPrice = op.valor_total / op.quantidade;
    insertOperation.run(positionId, op.tipo, op.data, op.quantidade, op.valor_total, unitPrice);
  }

  console.log(`   ✓ ${pos.ticker} — ${pos.nome} (${pos.classe_ativo}) — ${totalQty} unid. @ R$ ${avgPrice.toFixed(2)}`);
}

// Insert cached quotes
console.log('💰 Inserting cached quotes...');
const quotes = [
  { ticker: 'PETR4', preco: 30.00 },
  { ticker: 'VALE3', preco: 66.00 },
  { ticker: 'HGLG11', preco: 18.50 },
];

for (const q of quotes) {
  insertQuote.run(q.ticker, q.preco);
}

console.log(`   ✓ ${quotes.length} cached quotes inserted`);

db.close();

console.log('\n✅ Database seeded successfully!');
console.log('   Visit: http://localhost:3000');
console.log('   Positions: PETR4, VALE3, HGLG11, ABCD3, TEST99, BTCETF');
console.log('   Asset classes: Ações, FIIs, Renda Fixa, ETFs');

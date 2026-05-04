#!/usr/bin/env node
/**
 * Reset the SQLite database.
 * Usage: node scripts/db-reset.js [--confirm]
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../data');
const confirmed = process.argv.includes('--confirm');

if (!confirmed) {
  console.error('❌ This will DELETE all database files and data.');
  console.error('   Run with --confirm to proceed:');
  console.error('   npm run db:reset -- --confirm');
  process.exit(1);
}

if (!fs.existsSync(DATA_DIR)) {
  console.log('ℹ️  Data directory does not exist. Nothing to reset.');
  process.exit(0);
}

const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.db') || f.endsWith('.sqlite') || f.endsWith('.sqlite3'));

if (files.length === 0) {
  console.log('ℹ️  No database files found. Nothing to reset.');
  process.exit(0);
}

console.log(`🗑️  Deleting ${files.length} database file(s)...`);
for (const file of files) {
  const fullPath = path.join(DATA_DIR, file);
  try {
    fs.unlinkSync(fullPath);
    console.log(`   ✓ Deleted ${file}`);
  } catch (err) {
    console.error(`   ✗ Failed to delete ${file}: ${err.message}`);
  }
}

console.log('\n✅ Database reset complete.');
console.log('   Run "npm run db:seed" to populate with test data.');

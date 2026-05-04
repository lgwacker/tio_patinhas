#!/usr/bin/env node
/**
 * One-command setup: install → rebuild sqlite → build → start server.
 * Usage: node scripts/setup.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const nvmrcPath = path.resolve(__dirname, '../.nvmrc');

// 1. Verify Node version
if (fs.existsSync(nvmrcPath)) {
  const expectedVersion = fs.readFileSync(nvmrcPath, 'utf-8').trim();
  const actualVersion = process.version;
  if (!actualVersion.startsWith(`v${expectedVersion.split('.')[0]}`)) {
    console.warn(`⚠️  Node version mismatch: expected ~${expectedVersion}, got ${actualVersion}`);
    console.warn('   Consider running: nvm use');
  }
}

// 2. npm install
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
} catch {
  console.error('❌ npm install failed');
  process.exit(1);
}

// 3. Check env (postinstall already rebuilt sqlite)
console.log('🔍 Checking environment...');
try {
  execSync('node scripts/check-env.js', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
} catch {
  console.error('❌ Environment check failed');
  process.exit(1);
}

// 4. Build
console.log('🔨 Building application...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
} catch {
  console.error('❌ Build failed');
  process.exit(1);
}

// 5. Seed database
console.log('🌱 Seeding database...');
try {
  execSync('node scripts/db-seed.js', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
} catch {
  console.warn('⚠️  Database seed failed (non-fatal)');
}

// 6. Start server
console.log('\n🚀 Starting production server...');
try {
  execSync('npm run start:bg', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
} catch {
  console.error('❌ Failed to start server');
  process.exit(1);
}

console.log('\n✅ Setup complete!');
console.log('   Visit: http://localhost:3000');
console.log('   Logs:  npm run logs');
console.log('   Stop:  npm run stop');

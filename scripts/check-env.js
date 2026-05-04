#!/usr/bin/env node
/**
 * Environment compatibility check for native modules.
 * Runs on predev / prestart to catch better-sqlite3 ABI mismatches early.
 */

function checkEnv() {
  try {
    const Database = require('better-sqlite3');
    const db = new Database(':memory:');
    db.exec('SELECT 1');
    db.close();
    console.log(`✅ better-sqlite3 OK (Node ${process.version})`);
    return true;
  } catch (err) {
    console.error(`❌ better-sqlite3 failed with Node ${process.version}`);
    console.error(err.message);

    if (err.code === 'ERR_DLOPEN_FAILED') {
      console.error('\n→ The native binary was compiled for a different Node.js version.');
      console.error('→ Run: npm run rebuild:sqlite');
    }

    return false;
  }
}

// When run directly from CLI
if (require.main === module) {
  const ok = checkEnv();
  process.exit(ok ? 0 : 1);
}

module.exports = { checkEnv };

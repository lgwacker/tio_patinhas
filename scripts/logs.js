#!/usr/bin/env node
/**
 * Tail the live server log.
 * Usage: node scripts/logs.js [--lines N]
 */

const { spawn } = require('child_process');
const { getTodayLogPath } = require('./lib/logger');

const args = process.argv.slice(2);
const linesFlag = args.find((a) => a.startsWith('--lines='));
const lines = linesFlag ? linesFlag.split('=')[1] : '50';

const logPath = getTodayLogPath();

console.log(`📋 Tailing ${logPath} (last ${lines} lines, then follow)...\n`);

const tail = spawn('tail', ['-n', lines, '-f', logPath], {
  stdio: 'inherit',
});

tail.on('error', (err) => {
  console.error(`❌ Failed to tail logs: ${err.message}`);
  process.exit(1);
});

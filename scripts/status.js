#!/usr/bin/env node
/**
 * Show server status.
 * Usage: node scripts/status.js
 */

const { getRunningServer } = require('./lib/port-lock');
const { getTodayLogPath } = require('./lib/logger');

const running = getRunningServer();

if (!running) {
  console.log('┌─────────────┬────────────────────────────┐');
  console.log('│ Status      │ 🔴 Not running             │');
  console.log('└─────────────┴────────────────────────────┘');
  console.log('\nStart with: npm run dev:bg  or  npm run start:bg');
  process.exit(0);
}

const uptimeMs = Date.now() - new Date(running.startTime).getTime();
const uptimeMin = Math.floor(uptimeMs / 60000);
const uptimeSec = Math.floor((uptimeMs % 60000) / 1000);
const uptimeStr = uptimeMin > 0 ? `${uptimeMin}m ${uptimeSec}s` : `${uptimeSec}s`;

console.log('┌─────────────┬────────────────────────────┐');
console.log(`│ Status      │ 🟢 Running                 │`);
console.log(`│ Mode        │ ${String(running.mode).padEnd(26)} │`);
console.log(`│ URL         │ http://localhost:${String(running.port).padEnd(14)} │`);
console.log(`│ PID         │ ${String(running.pid).padEnd(26)} │`);
console.log(`│ Uptime      │ ${uptimeStr.padEnd(26)} │`);
console.log(`│ Log file    │ ${getTodayLogPath().padEnd(26)} │`);
console.log('└─────────────┴────────────────────────────┘');

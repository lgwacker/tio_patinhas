#!/usr/bin/env node
/**
 * Stop the running Next.js server gracefully, then forcefully if needed.
 * Usage: node scripts/stop-server.js
 */

const { getRunningServer, releaseLock } = require('./lib/port-lock');

const GRACEFUL_TIMEOUT_MS = 5000;
const POLL_INTERVAL_MS = 500;

const running = getRunningServer();

if (!running) {
  console.log('ℹ️  No server is currently running.');
  process.exit(0);
}

console.log(`🛑 Sending SIGTERM to server (PID ${running.pid}, port ${running.port})...`);

try {
  process.kill(running.pid, 'SIGTERM');
} catch (err) {
  console.error(`⚠️  Failed to send SIGTERM: ${err.message}`);
  console.log('🧹 Cleaning up stale lock file...');
  releaseLock();
  process.exit(0);
}

const startTime = Date.now();

function check() {
  const elapsed = Date.now() - startTime;
  const stillAlive = (() => {
    try {
      process.kill(running.pid, 0);
      return true;
    } catch {
      return false;
    }
  })();

  if (!stillAlive) {
    releaseLock();
    console.log('✅ Server stopped gracefully.');
    process.exit(0);
  }

  if (elapsed >= GRACEFUL_TIMEOUT_MS) {
    console.log('⏱️  Graceful timeout reached. Sending SIGKILL...');
    try {
      process.kill(running.pid, 'SIGKILL');
    } catch (err) {
      console.error(`⚠️  Failed to send SIGKILL: ${err.message}`);
    }
    releaseLock();
    console.log('💀 Server force-killed.');
    process.exit(0);
  }

  setTimeout(check, POLL_INTERVAL_MS);
}

check();

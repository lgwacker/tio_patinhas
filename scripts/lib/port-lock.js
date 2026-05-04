/**
 * Port / PID lock file management.
 * Ensures only one server instance runs at a time on a given port.
 */

const fs = require('fs');
const path = require('path');

const LOCK_FILE = path.resolve(__dirname, '../../.server.pid');

function readLock() {
  try {
    const raw = fs.readFileSync(LOCK_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeLock(data) {
  fs.writeFileSync(LOCK_FILE, JSON.stringify(data, null, 2));
}

function clearLock() {
  try {
    fs.unlinkSync(LOCK_FILE);
  } catch {
    // ignore
  }
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns { pid, port, mode, startTime } if a server is running,
 * or null if no valid lock exists.
 */
function getRunningServer() {
  const lock = readLock();
  if (!lock) return null;
  if (isProcessAlive(lock.pid)) {
    return lock;
  }
  // Stale lock — clean up
  clearLock();
  return null;
}

/**
 * Throws an error if a server is already running on the target port.
 */
function assertPortAvailable(port) {
  const running = getRunningServer();
  if (running) {
    throw new Error(
      `Server already running on PID ${running.pid} (port ${running.port}, mode: ${running.mode}).\n` +
      `Run "npm run stop" first, or visit http://localhost:${running.port}`
    );
  }
}

/**
 * Acquires the lock for a new server process.
 */
function acquireLock(pid, port, mode) {
  writeLock({ pid, port, mode, startTime: new Date().toISOString() });
}

/**
 * Releases the lock file.
 */
function releaseLock() {
  clearLock();
}

module.exports = {
  getRunningServer,
  assertPortAvailable,
  acquireLock,
  releaseLock,
  LOCK_FILE,
};

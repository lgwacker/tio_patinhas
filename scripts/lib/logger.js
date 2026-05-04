/**
 * Logger with daily rotation and 7-day retention.
 * Creates a symlink `logs/server.log` that always points to today's file.
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.resolve(__dirname, '../../logs');
const SYMLINK_PATH = path.join(LOG_DIR, 'server.log');
const RETENTION_DAYS = 7;

function getTodayFilename() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `server-${yyyy}-${mm}-${dd}.log`;
}

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function updateSymlink(targetFilename) {
  const targetPath = path.join(LOG_DIR, targetFilename);
  try {
    if (fs.existsSync(SYMLINK_PATH)) {
      fs.unlinkSync(SYMLINK_PATH);
    }
    fs.symlinkSync(targetFilename, SYMLINK_PATH);
  } catch {
    // On Windows symlinks may require elevated permissions; skip gracefully
  }
  return targetPath;
}

function cleanupOldLogs() {
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const files = fs.readdirSync(LOG_DIR);
  for (const file of files) {
    if (!file.startsWith('server-') || !file.endsWith('.log')) continue;
    const fullPath = path.join(LOG_DIR, file);
    try {
      const stats = fs.statSync(fullPath);
      if (stats.mtimeMs < cutoff) {
        fs.unlinkSync(fullPath);
      }
    } catch {
      // ignore cleanup errors
    }
  }
}

/**
 * Returns the writable log stream for today.
 * Call this once at server startup and pipe stdout/stderr into it.
 */
function createLogStream() {
  ensureLogDir();
  cleanupOldLogs();
  const filename = getTodayFilename();
  const filepath = updateSymlink(filename);
  return fs.createWriteStream(filepath, { flags: 'a' });
}

/**
 * Returns the path to today's log file (resolves symlink if possible).
 */
function getTodayLogPath() {
  ensureLogDir();
  if (fs.existsSync(SYMLINK_PATH)) {
    const target = fs.readlinkSync(SYMLINK_PATH);
    return path.resolve(LOG_DIR, target);
  }
  return path.join(LOG_DIR, getTodayFilename());
}

module.exports = { createLogStream, getTodayLogPath, LOG_DIR };

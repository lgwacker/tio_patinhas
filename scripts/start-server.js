#!/usr/bin/env node
/**
 * Start the Next.js server in the background.
 * Usage: node scripts/start-server.js --mode dev [--port 3000]
 *        node scripts/start-server.js --mode prod [--port 3000]
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { assertPortAvailable, acquireLock } = require('./lib/port-lock');
const { createLogStream } = require('./lib/logger');

function parseArg(name, defaultValue) {
  const args = process.argv.slice(2);
  const idx = args.findIndex((a) => a === `--${name}`);
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1];
  }
  const flag = args.find((a) => a.startsWith(`--${name}=`));
  if (flag) {
    return flag.split('=')[1];
  }
  return defaultValue;
}

const mode = parseArg('mode', 'dev');
const port = parseInt(parseArg('port', '3000'), 10);

if (!['dev', 'prod'].includes(mode)) {
  console.error('❌ Invalid mode. Use --mode=dev or --mode=prod');
  process.exit(1);
}

// Check env compatibility first
const { checkEnv } = require('./check-env');
if (!checkEnv()) {
  process.exit(1);
}

// Ensure single instance
try {
  assertPortAvailable(port);
} catch (err) {
  console.error(`❌ ${err.message}`);
  process.exit(1);
}

// For prod mode, verify build exists
if (mode === 'prod') {
  const buildDir = path.resolve(__dirname, '../.next');
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Production build not found. Run "npm run build" first.');
    process.exit(1);
  }
}

const logStream = createLogStream();
const nextBin = path.resolve(__dirname, '../node_modules/.bin/next');
const commandArgs = mode === 'dev' ? ['dev', '-p', String(port)] : ['start', '-p', String(port)];

console.log(`🚀 Starting ${mode} server on port ${port}...`);

// Use shell execution for reliable background spawning
const child = spawn(nextBin, commandArgs, {
  cwd: path.resolve(__dirname, '..'),
  detached: true,
  stdio: ['ignore', 'pipe', 'pipe'],
});

child.stdout.pipe(logStream);
child.stderr.pipe(logStream);

// Also mirror startup output to console for immediate feedback
let startupOutput = '';
const mirrorToConsole = (data) => {
  const chunk = data.toString();
  startupOutput += chunk;
  process.stdout.write(chunk);
};
child.stdout.on('data', mirrorToConsole);
child.stderr.on('data', mirrorToConsole);

child.unref();

// Wait for server to be ready
const checkReady = () => {
  const http = require('http');
  const req = http.get(`http://localhost:${port}`, (res) => {
    if (res.statusCode === 200) {
      // Stop mirroring to console after startup
      child.stdout.removeListener('data', mirrorToConsole);
      child.stderr.removeListener('data', mirrorToConsole);

      acquireLock(child.pid, port, mode);
      console.log(`\n✅ ${mode === 'dev' ? 'Dev' : 'Production'} server running at http://localhost:${port} (PID ${child.pid})`);
      console.log(`📝 Logs: logs/server.log`);
      console.log(`🛑 Stop: npm run stop`);
      process.exit(0);
    } else {
      console.error(`\n⚠️ Server responded with status ${res.statusCode}`);
      process.exit(1);
    }
  });
  req.on('error', (err) => {
    console.error(`\n⚠️ Server failed to start: ${err.message}`);
    if (startupOutput.includes('Error')) {
      console.error('\nStartup output:\n', startupOutput.slice(-500));
    }
    process.exit(1);
  });
};

// Give Next.js time to start
setTimeout(checkReady, 4000);

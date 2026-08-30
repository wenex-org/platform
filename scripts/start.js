/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

const os = require('os');
const fs = require('fs');
const path = require('path');

const { spawn } = require('child_process');

console.log('Static MachineID:', process.env.MACHINE_ID);

// Get the service name from command-line arguments (default to 'gateway')
const SERVICE_NAME = process.env.SERVICE_NAME || 'gateway';

// V8 heap ceiling in MB — chosen, not whatever V8 picks from the host's RAM (~4 GB): a leak then fails
// fast and legibly instead of bloating for hours; keep it below the container's memory limit
const MAX_OLD_SPACE_SIZE = Number(process.env.NODE_MAX_OLD_SPACE_SIZE) || 2048;

// Exit like a shell would: a child killed by a signal (SIGABRT on heap exhaustion, SIGKILL from the
// kernel) reports 128 + signal number, so a crash never reads as a clean exit 0
const exitCodeOf = (code, signal) => code ?? (signal ? 128 + (os.constants.signals[signal] || 0) : 1);

// Function to execute a Node.js process with specified stack size and signal forwarding
function runNodeProcess(filePath) {
  console.log(`Starting service: ${SERVICE_NAME} from ${filePath}`);
  const nodeProcess = spawn('node', ['--stack-size=4096', `--max-old-space-size=${MAX_OLD_SPACE_SIZE}`, filePath], {
    stdio: 'inherit', // Inherit stdio to show output in console
  });

  // Handle SIGTERM in parent and forward to child
  const shutdown = (signal) => {
    console.log(`Received ${signal}. Forwarding to child...`);
    nodeProcess.kill(signal);
  };

  process.on('SIGTERM', shutdown);

  nodeProcess.on('error', (error) => {
    console.error(`Failed to start process: ${error.message}`);
    process.exit(1);
  });

  nodeProcess.on('exit', (code, signal) => {
    console.log(`Child process exited with code ${code} and signal ${signal}`);
    process.exit(exitCodeOf(code, signal));
  });

  // Also listen for child close to clean up handlers
  nodeProcess.on('close', (code, signal) => {
    process.removeListener('SIGTERM', shutdown);
    process.exit(exitCodeOf(code, signal));
  });
}

// Main logic
if (SERVICE_NAME === 'gateway') {
  const gatewayPath = path.join(__dirname, '../wnx/apps/gateway/main.js');
  if (fs.existsSync(gatewayPath)) {
    runNodeProcess(gatewayPath);
  } else {
    console.error('Gateway service not found...!');
    process.exit(1);
  }
} else {
  const servicePath = path.join(__dirname, `../wnx/apps/services/${SERVICE_NAME}/main.js`);
  const workerPath = path.join(__dirname, `../wnx/apps/workers/${SERVICE_NAME}/main.js`);

  if (fs.existsSync(servicePath)) {
    runNodeProcess(servicePath);
  } else if (fs.existsSync(workerPath)) {
    runNodeProcess(workerPath);
  } else {
    console.error('Service or Worker not found...!');
    process.exit(1);
  }
}

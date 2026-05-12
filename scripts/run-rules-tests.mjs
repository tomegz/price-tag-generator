import { spawn } from 'node:child_process';
import { createServer, createConnection } from 'node:net';
import { dirname, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const imageTag = 'price-tag-generator-firebase-emulators:rules';
const containerName = `price-tag-generator-rules-${process.pid}`;

function runCommand(command, args, { env = {}, stdio = 'inherit', rejectOnFailure = true } = {}) {
  return new Promise((resolveCommand, rejectCommand) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: {
        ...process.env,
        ...env
      },
      stdio
    });

    child.once('error', rejectCommand);
    child.once('exit', code => {
      if (code === 0 || !rejectOnFailure) {
        resolveCommand(code ?? 0);
        return;
      }

      rejectCommand(new Error(`Command failed with exit code ${code}: ${command} ${args.join(' ')}`));
    });
  });
}

async function findAvailablePort() {
  return new Promise((resolvePort, rejectPort) => {
    const server = createServer();
    server.once('error', rejectPort);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      server.close(() => {
        if (port) {
          resolvePort(port);
        } else {
          rejectPort(new Error('Unable to allocate a local port for the database emulator.'));
        }
      });
    });
  });
}

async function canConnect(port) {
  return new Promise(resolvePort => {
    const socket = createConnection({ host: '127.0.0.1', port });
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolvePort(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolvePort(false);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolvePort(false);
    });
  });
}

async function waitForPort(port) {
  const deadline = Date.now() + 120000;

  while (Date.now() < deadline) {
    if (await canConnect(port)) return;
    await delay(500);
  }

  throw new Error(`Timed out waiting for Firebase Realtime Database emulator on port ${port}.`);
}

async function waitForDatabaseHttp(port) {
  const deadline = Date.now() + 120000;
  const databaseUrl = `http://127.0.0.1:${port}/.json?ns=demo-price-tag-generator-default-rtdb`;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(databaseUrl);
      if (response.status < 500) return;
    } catch {
      // The database emulator can open its socket before its HTTP handler is ready.
    }
    await delay(500);
  }

  throw new Error(`Timed out waiting for Firebase Realtime Database emulator HTTP at ${databaseUrl}.`);
}

async function cleanupContainer() {
  await runCommand('docker', ['rm', '-f', containerName], {
    stdio: 'ignore',
    rejectOnFailure: false
  });
}

const databaseHostPort = await findAvailablePort();

try {
  await cleanupContainer();
  await runCommand('docker', [
    'build',
    '-f',
    'docker/firebase-emulators.Dockerfile',
    '-t',
    imageTag,
    '.'
  ]);
  await runCommand('docker', [
    'run',
    '-d',
    '--name',
    containerName,
    '-p',
    `127.0.0.1:${databaseHostPort}:9000`,
    '-v',
    `${repoRoot}:/workspace`,
    '-w',
    '/workspace',
    imageTag,
    'firebase',
    '--project',
    'demo-price-tag-generator',
    '--config',
    'firebase.docker.json',
    'emulators:start',
    '--only',
    'database'
  ]);

  await waitForPort(databaseHostPort);
  await waitForDatabaseHttp(databaseHostPort);
  await runCommand('pnpm', ['exec', 'vitest', 'run', '--config', 'vitest.rules.config.ts'], {
    env: {
      FIREBASE_DATABASE_EMULATOR_HOST: `127.0.0.1:${databaseHostPort}`,
      FIREBASE_RULES_DATABASE_EMULATOR_HOST: '127.0.0.1',
      FIREBASE_RULES_DATABASE_EMULATOR_PORT: String(databaseHostPort)
    }
  });
} finally {
  await cleanupContainer();
}

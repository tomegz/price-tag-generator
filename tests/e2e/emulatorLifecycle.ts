import { execFile } from 'node:child_process';
import { createConnection } from 'node:net';
import { dirname, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);

const e2eDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(e2eDir, '../..');
const seedDataPath = resolve(e2eDir, 'seed-data.json');
const composeProjectName = 'price-tag-generator-e2e';
const exportDir = 'emulator-data-e2e';
const authHostPort = 19099;
const databaseHostPort = 19000;
const uiHostPort = 4400;

type CommandOptions = {
  env?: NodeJS.ProcessEnv;
};

function e2eEnv(extraEnv: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    ...process.env,
    FIREBASE_EMULATOR_EXPORT_DIR: exportDir,
    FIREBASE_AUTH_EMULATOR_HOST_PORT: String(authHostPort),
    FIREBASE_DATABASE_EMULATOR_HOST_PORT: String(databaseHostPort),
    FIREBASE_EMULATOR_UI_HOST_PORT: String(uiHostPort),
    ...extraEnv
  };
}

async function runCommand(
  command: string,
  args: string[],
  { env = e2eEnv() }: CommandOptions = {}
): Promise<void> {
  try {
    await execFileAsync(command, args, {
      cwd: repoRoot,
      env,
      maxBuffer: 1024 * 1024 * 10
    });
  } catch (error) {
    const commandError = error as { message?: string; stderr?: string; stdout?: string };
    const output = [commandError.stdout, commandError.stderr].filter(Boolean).join('\n');
    throw new Error(
      [`Command failed: ${command} ${args.join(' ')}`, commandError.message, output]
        .filter(Boolean)
        .join('\n'),
      { cause: error }
    );
  }
}

async function canConnect(port: number): Promise<boolean> {
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

async function waitForPort(port: number, label: string): Promise<void> {
  const deadline = Date.now() + 120000;

  while (Date.now() < deadline) {
    if (await canConnect(port)) return;
    await delay(500);
  }

  throw new Error(`Timed out waiting for ${label} on port ${port}.`);
}

async function waitForHttp(url: string, label: string): Promise<void> {
  const deadline = Date.now() + 120000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
    } catch {
      // Keep polling until the emulator UI finishes booting.
    }
    await delay(500);
  }

  throw new Error(`Timed out waiting for ${label} at ${url}.`);
}

export async function seedE2eEmulatorData(): Promise<void> {
  await runCommand('pnpm', ['emulators:seed'], {
    env: e2eEnv({
      FIREBASE_SEED_DATA_FILE: seedDataPath
    })
  });
}

export async function startE2eEmulators(): Promise<void> {
  await runCommand('docker', [
    'compose',
    '-p',
    composeProjectName,
    'up',
    '-d',
    '--build',
    'firebase-emulators'
  ]);
}

export async function stopE2eEmulators(): Promise<void> {
  await runCommand('docker', ['compose', '-p', composeProjectName, 'down', '--remove-orphans']);
}

export async function waitForE2eEmulators(): Promise<void> {
  await Promise.all([
    waitForPort(authHostPort, 'Firebase Auth emulator'),
    waitForPort(databaseHostPort, 'Firebase Realtime Database emulator'),
    waitForPort(uiHostPort, 'Firebase Emulator UI')
  ]);
  await waitForHttp(`http://127.0.0.1:${uiHostPort}`, 'Firebase Emulator UI');
}

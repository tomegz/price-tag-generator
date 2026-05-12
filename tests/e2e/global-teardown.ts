import { stopE2eEmulators } from './emulatorLifecycle';

export default async function globalTeardown(): Promise<void> {
  await stopE2eEmulators();
}

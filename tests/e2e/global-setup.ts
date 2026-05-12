import {
  seedE2eEmulatorData,
  startE2eEmulators,
  stopE2eEmulators,
  waitForE2eEmulators
} from './emulatorLifecycle';

export default async function globalSetup(): Promise<void> {
  await stopE2eEmulators();
  await seedE2eEmulatorData();
  await startE2eEmulators();
  await waitForE2eEmulators();
}

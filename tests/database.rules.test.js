import { readFileSync } from 'node:fs';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import { get, ref, set } from 'firebase/database';
import { readRulesDatabaseEmulatorConfig } from './rulesEmulatorConfig.js';

let testEnv;
const databaseEmulator = readRulesDatabaseEmulatorConfig();

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-price-tag-generator',
    database: {
      rules: readFileSync('database.rules.json', 'utf8'),
      ...databaseEmulator
    }
  });
});

afterEach(async () => {
  await testEnv.clearDatabase();
});

afterAll(async () => {
  await testEnv?.cleanup();
});

describe('Realtime Database rules', () => {
  it('allows an owner to read and write items', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await set(ref(context.database(), 'profi-bike/ownerUids/owner-uid'), true);
    });

    const db = testEnv.authenticatedContext('owner-uid').database();
    await assertSucceeds(
      set(ref(db, 'profi-bike/items/item-1'), {
        name: 'Kross',
        model: 'Demo',
        price: 1000,
        discountPrice: 900,
        discountStatus: 'on',
        year: 2026
      })
    );
    await assertSucceeds(get(ref(db, 'profi-bike/items')));
  });

  it('denies non-owner access', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await set(ref(context.database(), 'profi-bike/ownerUids/owner-uid'), true);
    });

    const db = testEnv.authenticatedContext('other-uid').database();
    await assertFails(get(ref(db, 'profi-bike/items')));
  });

  it('denies unauthenticated access', async () => {
    const db = testEnv.unauthenticatedContext().database();
    await assertFails(get(ref(db, 'profi-bike/items')));
  });

  it('rejects invalid item fields', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await set(ref(context.database(), 'profi-bike/ownerUids/owner-uid'), true);
    });

    const db = testEnv.authenticatedContext('owner-uid').database();
    await assertFails(
      set(ref(db, 'profi-bike/items/item-1'), {
        name: 'Kross',
        model: 'Demo',
        price: '1000',
        discountPrice: 900,
        discountStatus: 'on',
        year: 2026
      })
    );
  });
});

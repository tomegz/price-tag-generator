// @vitest-environment node
import { readFileSync } from 'node:fs';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { get, ref, set, type Database } from 'firebase/database';

import { readRulesDatabaseEmulatorConfig } from './rulesEmulatorConfig.js';
import {
  createCatalogRepository,
  isPermissionDenied,
  type CatalogRepository,
  type FirebaseRepositoryError
} from '@/services/firebase/catalogRepository';
import type { LegacyCatalogItem } from '@/domains/catalog/catalog';
import type { CatalogItemInput, CatalogItemsById } from '@/domains/catalog/catalogItem';

let testEnv: RulesTestEnvironment;
const databaseEmulator = readRulesDatabaseEmulatorConfig();

const validItem: LegacyCatalogItem = {
  name: 'Kross',
  model: 'Demo',
  price: 1000,
  discountPrice: 900,
  discountStatus: 'on',
  year: 2026
};

const validCatalogItem: CatalogItemInput = {
  brand: 'Kross',
  model: 'Demo',
  price: 1000,
  discountPrice: 900,
  discountEnabled: true,
  year: 2026
};

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

async function seedOwner(uid = 'owner-uid'): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async context => {
    await set(ref(context.database(), `profi-bike/ownerUids/${uid}`), true);
  });
}

async function seedLegacyOwnerOnly(uid = 'legacy-owner-uid'): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async context => {
    await set(ref(context.database(), 'profi-bike/owners'), [uid]);
  });
}

async function seedCatalogData(): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async context => {
    const database = context.database();
    await set(ref(database, 'profi-bike/brands'), ['Kross', 'Giant']);
    await set(ref(database, 'profi-bike/items/item-1'), validItem);
    await set(ref(database, 'profi-bike/owners'), ['owner-uid']);
    await set(ref(database, 'profi-bike/ownerUids/owner-uid'), true);
  });
}

function readItemsOnce(repository: CatalogRepository): Promise<CatalogItemsById> {
  return new Promise((resolve, reject) => {
    let unsubscribe: () => void = () => {};
    const timeout = setTimeout(() => {
      unsubscribe();
      reject(new Error('Timed out waiting for catalog repository items.'));
    }, 5000);

    unsubscribe = repository.subscribeCatalogItems({
      next(items) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(items);
      },
      error(error) {
        clearTimeout(timeout);
        unsubscribe();
        reject(error);
      }
    });
  });
}

function readItemsDenied(repository: CatalogRepository): Promise<FirebaseRepositoryError> {
  return new Promise((resolve, reject) => {
    let unsubscribe: () => void = () => {};
    const timeout = setTimeout(() => {
      unsubscribe();
      reject(new Error('Timed out waiting for catalog repository denial.'));
    }, 5000);

    unsubscribe = repository.subscribeCatalogItems({
      next() {
        clearTimeout(timeout);
        unsubscribe();
        reject(new Error('Expected catalog repository read to be denied.'));
      },
      error(error) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(error);
      }
    });
  });
}

function authenticatedRepository(uid: string): CatalogRepository {
  const database = testEnv.authenticatedContext(uid).database() as Database;
  return createCatalogRepository(database);
}

function authenticatedDatabase(uid: string): Database {
  return testEnv.authenticatedContext(uid).database() as Database;
}

function unauthenticatedDatabase(): Database {
  return testEnv.unauthenticatedContext().database() as Database;
}

describe('CatalogRepository security rules integration', () => {
  it('allows an owner to read and write items', async () => {
    await seedOwner();

    const repository = authenticatedRepository('owner-uid');

    await assertSucceeds(repository.saveCatalogItem('item-1', validCatalogItem));
    await assertSucceeds(repository.saveCatalogItems({
      'item-2': { ...validCatalogItem, model: 'Batch demo' }
    }));
    await expect(readItemsOnce(repository)).resolves.toEqual({
      'item-1': { ...validCatalogItem, id: 'item-1' },
      'item-2': { ...validCatalogItem, id: 'item-2', model: 'Batch demo' }
    });

    await assertSucceeds(repository.deleteCatalogItem('item-1'));
    await assertSucceeds(repository.deleteCatalogItem('item-2'));
    await expect(readItemsOnce(repository)).resolves.toEqual({});
  });

  it('denies legacy brands reads and writes for every client context', async () => {
    await seedCatalogData();

    const ownerDatabase = authenticatedDatabase('owner-uid');
    const nonOwnerDatabase = authenticatedDatabase('other-uid');
    const anonymousDatabase = unauthenticatedDatabase();

    await assertFails(get(ref(ownerDatabase, 'profi-bike/brands')));
    await assertFails(set(ref(ownerDatabase, 'profi-bike/brands'), ['Kross']));
    await assertFails(get(ref(nonOwnerDatabase, 'profi-bike/brands')));
    await assertFails(set(ref(nonOwnerDatabase, 'profi-bike/brands'), ['Kross']));
    await assertFails(get(ref(anonymousDatabase, 'profi-bike/brands')));
    await assertFails(set(ref(anonymousDatabase, 'profi-bike/brands'), ['Kross']));
  });

  it('allows an owner to read owners and ownerUids but denies client writes to both nodes', async () => {
    await seedCatalogData();

    const database = authenticatedDatabase('owner-uid');

    await assertSucceeds(get(ref(database, 'profi-bike/owners')));
    await assertSucceeds(get(ref(database, 'profi-bike/ownerUids')));
    await assertFails(set(ref(database, 'profi-bike/owners'), ['owner-uid', 'other-uid']));
    await assertFails(set(ref(database, 'profi-bike/ownerUids/other-uid'), true));
  });

  it('denies unauthenticated reads and writes', async () => {
    await seedCatalogData();

    const database = unauthenticatedDatabase();

    await assertFails(get(ref(database, 'profi-bike/brands')));
    await assertFails(get(ref(database, 'profi-bike/items')));
    await assertFails(set(ref(database, 'profi-bike/items/item-2'), validItem));
    await assertFails(get(ref(database, 'profi-bike/owners')));
    await assertFails(get(ref(database, 'profi-bike/ownerUids')));
  });

  it('surfaces permission errors for non-owner reads and writes', async () => {
    await seedCatalogData();

    const repository = authenticatedRepository('other-uid');
    const database = authenticatedDatabase('other-uid');

    await assertFails(get(ref(database, 'profi-bike/brands')));
    await assertFails(repository.saveCatalogItem('item-1', validCatalogItem));
    await assertFails(set(ref(database, 'profi-bike/brands'), ['Kross']));
    await assertFails(get(ref(database, 'profi-bike/owners')));
    await assertFails(get(ref(database, 'profi-bike/ownerUids')));
    const deniedError = await readItemsDenied(repository);
    expect(isPermissionDenied(deniedError)).toBe(true);
  });

  it('denies unrelated root paths even for owners', async () => {
    await seedOwner();

    const database = authenticatedDatabase('owner-uid');

    await assertFails(get(ref(database, 'other-store')));
    await assertFails(set(ref(database, 'other-store/items/item-1'), validItem));
  });

  it('allows an owner batch delete through the repository', async () => {
    await seedCatalogData();

    const repository = authenticatedRepository('owner-uid');
    await assertSucceeds(repository.saveCatalogItem('item-2', { ...validCatalogItem, model: 'Second' }));

    await assertSucceeds(repository.deleteCatalogItems(['item-1', 'item-2']));

    await expect(readItemsOnce(repository)).resolves.toEqual({});
  });

  it('rejects malformed discountStatus, discountPrice, price, and year fields', async () => {
    await seedOwner();

    const database = authenticatedDatabase('owner-uid');
    const invalidItems = {
      invalidDiscountStatus: { ...validItem, discountStatus: 'sale' },
      invalidDiscountPrice: { ...validItem, discountPrice: -1 },
      invalidPrice: { ...validItem, price: '1000' },
      invalidYear: { ...validItem, year: true }
    };

    for (const [itemId, item] of Object.entries(invalidItems)) {
      await assertFails(set(ref(database, `profi-bike/items/${itemId}`), item));
    }
  });

  it('uses ownerUids as the authorization source of truth instead of legacy owners', async () => {
    await seedLegacyOwnerOnly();

    const repository = authenticatedRepository('legacy-owner-uid');

    await assertFails(repository.saveCatalogItem('item-1', validCatalogItem));
    const deniedError = await readItemsDenied(repository);
    expect(isPermissionDenied(deniedError)).toBe(true);
  });
});

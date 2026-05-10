// @vitest-environment node
import { readFileSync } from 'node:fs';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { ref, set, type Database } from 'firebase/database';

import {
  createCatalogRepository,
  isPermissionDenied,
  type CatalogRepository,
  type FirebaseRepositoryError
} from '../src/services/firebase/catalogRepository';
import type { CatalogItemsById, LegacyCatalogItem } from '../src/domains/catalog/catalog';

let testEnv: RulesTestEnvironment;

const validItem: LegacyCatalogItem = {
  name: 'Kross',
  model: 'Demo',
  price: 1000,
  discountPrice: 900,
  discountStatus: 'on',
  year: 2026
};

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-price-tag-generator',
    database: {
      rules: readFileSync('database.rules.json', 'utf8'),
      host: '127.0.0.1',
      port: 9000
    }
  });
});

afterEach(async () => {
  await testEnv.clearDatabase();
});

afterAll(async () => {
  await testEnv.cleanup();
});

async function seedOwner(uid = 'owner-uid'): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async context => {
    await set(ref(context.database(), `profi-bike/ownerUids/${uid}`), true);
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

describe('CatalogRepository security rules integration', () => {
  it('allows an owner to write, read, and delete catalog items', async () => {
    await seedOwner();

    const repository = authenticatedRepository('owner-uid');

    await assertSucceeds(repository.saveCatalogItem('item-1', validItem));
    await assertSucceeds(repository.saveCatalogItems({
      'item-2': { ...validItem, model: 'Batch demo' }
    }));
    await expect(readItemsOnce(repository)).resolves.toEqual({
      'item-1': validItem,
      'item-2': { ...validItem, model: 'Batch demo' }
    });

    await assertSucceeds(repository.deleteCatalogItem('item-1'));
    await assertSucceeds(repository.deleteCatalogItem('item-2'));
    await expect(readItemsOnce(repository)).resolves.toEqual({});
  });

  it('surfaces permission errors for non-owner reads and writes', async () => {
    await seedOwner();

    const repository = authenticatedRepository('other-uid');

    await assertFails(repository.saveCatalogItem('item-1', validItem));
    const deniedError = await readItemsDenied(repository);
    expect(isPermissionDenied(deniedError)).toBe(true);
  });
});

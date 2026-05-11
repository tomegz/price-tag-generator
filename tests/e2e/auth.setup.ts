import { expect, test as setup } from '@playwright/test';
import { dirname } from 'node:path';
import { mkdirSync } from 'node:fs';

const authFile = 'playwright/.auth/owner.json';

setup('authenticate owner', async ({ page }) => {
  mkdirSync(dirname(authFile), { recursive: true });

  await page.goto('./');
  await page.getByLabel('E-mail').fill('owner@example.test');
  await page.getByLabel('Hasło').fill('password123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  await expect(page.getByRole('heading', { name: /Produkty/ })).toBeVisible();
  await page.context().storageState({ path: authFile, indexedDB: true });
});

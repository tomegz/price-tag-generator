import { expect, test } from '@playwright/test';
import { gotoApp, openCatalogAdmin } from './helpers';

test('creates, edits, and deletes a catalog product', async ({ page }) => {
  await gotoApp(page);
  await openCatalogAdmin(page);

  await page.getByRole('button', { name: 'Dodaj produkt' }).click();

  const addRow = page.getByTestId('admin-add-row');
  await addRow.getByLabel('Marka').fill('E2E Brand');
  await addRow.getByLabel('Model').fill('E2E Smoke');
  await addRow.getByLabel('Rok').fill('2026');
  await addRow.getByLabel('Cena').fill('1234');
  await addRow.getByRole('button', { name: 'Zapisz' }).click();

  const createdRow = page.getByTestId('admin-product-row').filter({ hasText: 'E2E Smoke' });
  await expect(createdRow).toBeVisible();

  const productId = await createdRow.getAttribute('data-product-id');
  if (!productId) throw new Error('Created e2e product row did not expose a product id.');

  const row = page.locator(`[data-testid="admin-product-row"][data-product-id="${productId}"]`);
  await row.getByRole('button', { name: 'Edytuj' }).click();
  await row.getByLabel('Model').fill('E2E Smoke Edited');
  await row.getByRole('button', { name: 'Zapisz' }).click();

  await expect(row).toContainText('E2E Smoke Edited');

  page.once('dialog', dialog => dialog.accept());
  await row.getByRole('button', { name: /Usuń/ }).click();

  await expect(row).toHaveCount(0);
});

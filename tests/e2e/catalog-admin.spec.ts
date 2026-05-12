import { expect, test } from '@playwright/test';
import { gotoApp, openCatalogAdmin } from './helpers';

test('creates, edits, and deletes a catalog product', async ({ page }) => {
  await gotoApp(page);
  await openCatalogAdmin(page);

  await page.getByRole('button', { name: 'Dodaj produkt' }).click();

  const addRow = page.getByTestId('admin-add-row');
  await addRow.getByLabel('Marka').fill('E2E Brand');
  await addRow.getByLabel('Model').fill('E2E Smoke');
  await addRow.getByLabel('Rocznik').fill('2026');
  await addRow.getByLabel('Cena katalogowa').fill('1234');
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

  await row.getByRole('button', { name: /Usuń/ }).click();
  const confirmDialog = page.getByRole('dialog', { name: /Usuń 1 produkt/ });
  await expect(confirmDialog).toBeVisible();
  await confirmDialog.getByRole('button', { name: 'Usuń 1' }).click();

  await expect(row).toHaveCount(0);
});

test('bulk deletes selected catalog products with typed confirmation', async ({ page }) => {
  await gotoApp(page);
  await openCatalogAdmin(page);

  await page.getByRole('button', { name: 'Dodaj produkt' }).click();
  const addRow = page.getByTestId('admin-add-row');
  await addRow.getByLabel('Marka').fill('E2E Brand');
  await addRow.getByLabel('Model').fill('E2E Bulk Delete');
  await addRow.getByLabel('Rocznik').fill('2026');
  await addRow.getByLabel('Cena katalogowa').fill('999');
  await addRow.getByRole('button', { name: 'Zapisz' }).click();

  const createdRow = page.getByTestId('admin-product-row').filter({ hasText: 'E2E Bulk Delete' });
  await expect(createdRow).toBeVisible();

  const productId = await createdRow.getAttribute('data-product-id');
  if (!productId) throw new Error('Created e2e product row did not expose a product id.');

  const row = page.locator(`[data-testid="admin-product-row"][data-product-id="${productId}"]`);
  await page.getByRole('group', { name: 'Tryb edycji cennika' }).getByRole('button', { name: 'Edycja zbiorcza' }).click();
  await row.getByRole('checkbox', { name: /Zaznacz/ }).check();
  await page.getByRole('button', { name: 'Usuń' }).click();

  const confirmDialog = page.getByRole('dialog', { name: /Usuń 1 produkt/ });
  await expect(confirmDialog).toBeVisible();
  await expect(confirmDialog.getByRole('button', { name: 'Usuń 1' })).toBeDisabled();
  await confirmDialog.getByLabel('Potwierdzenie usunięcia').fill('usuń');
  await confirmDialog.getByRole('button', { name: 'Usuń 1' }).click();

  await expect(row).toHaveCount(0);
});

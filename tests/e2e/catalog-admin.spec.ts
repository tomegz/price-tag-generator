import { expect, test, type Page } from '@playwright/test';
import { gotoApp, openCatalogAdmin } from './helpers';

async function addAdminProduct(page: Page, brand: string, model: string): Promise<void> {
  await page.getByRole('button', { name: 'Dodaj produkt' }).click();

  const addRow = page.getByTestId('admin-add-row');
  await addRow.getByLabel('Marka').fill(brand);
  await addRow.getByLabel('Model').fill(model);
  await addRow.getByLabel('Rocznik').fill('2026');
  await addRow.getByLabel('Cena katalogowa').fill('999');
  await addRow.getByRole('button', { name: 'Zapisz' }).click();

  await expect(page.getByTestId('admin-product-row').filter({ hasText: model })).toBeVisible();
}

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

test('bulk deleting all products for an active brand removes that brand filter', async ({ page }) => {
  await gotoApp(page);
  await openCatalogAdmin(page);

  const brand = 'E2E Vanishing Brand';
  await addAdminProduct(page, brand, 'E2E Vanish First');
  await addAdminProduct(page, brand, 'E2E Vanish Second');

  const brandFilters = page.getByRole('group', { name: 'Filtr marki' });
  await brandFilters.getByRole('button', { name: brand }).click();
  await expect(brandFilters.getByRole('button', { name: brand, pressed: true })).toBeVisible();
  await expect(page.getByTestId('admin-product-row')).toHaveCount(2);

  await page.getByRole('group', { name: 'Tryb edycji cennika' }).getByRole('button', { name: 'Edycja zbiorcza' }).click();
  await page.getByLabel('Zaznacz wszystko').check();
  await page.getByRole('button', { name: 'Usuń' }).click();

  const confirmDialog = page.getByRole('dialog', { name: /Usuń 2 produkty/ });
  await expect(confirmDialog).toBeVisible();
  await expect(confirmDialog.getByRole('button', { name: 'Usuń 2' })).toBeDisabled();
  await confirmDialog.getByLabel('Potwierdzenie usunięcia').fill('usuń');
  await confirmDialog.getByRole('button', { name: 'Usuń 2' }).click();

  await expect(page.getByTestId('admin-product-row').filter({ hasText: brand })).toHaveCount(0);
  await expect(brandFilters.getByRole('button', { name: brand })).toHaveCount(0);
  await expect(brandFilters.getByRole('button', { name: 'Wszystkie', pressed: true })).toBeVisible();
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

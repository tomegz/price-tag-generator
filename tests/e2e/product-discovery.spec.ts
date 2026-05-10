import { expect, test } from '@playwright/test';
import { gotoApp, productRow, seedItems } from './helpers';

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
});

test('searches, filters, and sorts products', async ({ page }) => {
  await expect(productRow(page, seedItems.queue)).toBeVisible();
  await expect(productRow(page, seedItems.expensive)).toBeVisible();

  await page.getByLabel('Szukaj produktu').fill('Queue Runner');
  await expect(productRow(page, seedItems.queue)).toBeVisible();
  await expect(productRow(page, seedItems.expensive)).toBeHidden();

  await page.getByLabel('Szukaj produktu').clear();
  await page.getByRole('group', { name: 'Filtr marki' }).getByRole('button', { name: 'Kross' }).click();
  await expect(productRow(page, seedItems.bulk)).toBeVisible();
  await expect(productRow(page, seedItems.queue)).toBeHidden();

  await page.getByRole('group', { name: 'Filtr marki' }).getByRole('button', { name: 'Wszystkie' }).click();
  await page.getByRole('group', { name: 'Sortowanie produktów' }).getByRole('button', { name: 'Cena' }).click();

  await expect(page.getByTestId('product-row').first()).toHaveAttribute(
    'data-product-id',
    seedItems.expensive
  );
});

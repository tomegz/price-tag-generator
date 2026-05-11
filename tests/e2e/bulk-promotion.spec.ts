import { expect, test } from '@playwright/test';
import {
  adminProductRow,
  gotoApp,
  openCatalogAdmin,
  seedItems
} from './helpers';

test('applies a bulk percentage promotion to selected products', async ({ page }) => {
  await gotoApp(page);
  await openCatalogAdmin(page);

  await page.getByRole('group', { name: 'Tryb edycji cennika' }).getByRole('button', { name: 'Edycja zbiorcza' }).click();
  const adminRow = adminProductRow(page, seedItems.bulk);
  await expect(adminRow).toContainText('Bulk Target');
  await adminRow.getByRole('checkbox', { name: /Zaznacz/ }).check();

  await page.getByRole('button', { name: 'Promocja' }).click();
  await expect(page.getByRole('dialog', { name: 'Promocja zbiorcza' })).toBeVisible();
  await expect(page.getByLabel('Podgląd promocji')).toContainText('700 zł');

  await page.getByRole('button', { name: /Zastosuj promocję do .*1.* produktu/ }).click();
  await expect(page.getByRole('dialog', { name: 'Promocja zbiorcza' })).toHaveCount(0);

  await expect(adminProductRow(page, seedItems.bulk)).toContainText('700 zł');
});

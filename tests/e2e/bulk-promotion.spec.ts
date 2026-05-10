import { expect, test } from '@playwright/test';
import {
  adminProductRow,
  bulkProductRow,
  gotoApp,
  openCatalogAdmin,
  seedItems
} from './helpers';

test('applies a bulk percentage promotion to selected products', async ({ page }) => {
  await gotoApp(page);
  await openCatalogAdmin(page);

  await page.getByRole('button', { name: 'Promocja zbiorcza' }).click();
  await expect(page.getByRole('dialog', { name: 'Promocja zbiorcza' })).toBeVisible();

  const bulkRow = bulkProductRow(page, seedItems.bulk);
  await expect(bulkRow).toContainText('Bulk Target');
  await bulkRow.getByRole('checkbox').check();

  await page.getByRole('button', { name: /Dalej \(1\)/ }).click();
  await expect(page.getByLabel('Podgląd promocji')).toContainText('700 zł');

  await page.getByRole('button', { name: /Zastosuj promocję do .*1.* produktów/ }).click();
  await expect(page.getByRole('dialog', { name: 'Promocja zbiorcza' })).toHaveCount(0);

  await expect(adminProductRow(page, seedItems.bulk)).toContainText('700 zł');
});

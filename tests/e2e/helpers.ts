import { expect, type Locator, type Page } from '@playwright/test';

export const ownerEmail = 'owner@example.test';
export const ownerPassword = 'password123';

export const seedItems = {
  bulk: 'item-e2e-bulk',
  expensive: 'item-e2e-sort-expensive',
  promo: 'item-e2e-promo',
  queue: 'item-e2e-queue'
} as const;

export async function gotoApp(page: Page): Promise<void> {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: /Produkty/ })).toBeVisible();
}

export async function login(page: Page, email = ownerEmail, password = ownerPassword): Promise<void> {
  await page.goto('./');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Hasło').fill(password);
  await page.getByRole('button', { name: 'Zaloguj' }).click();
}

export function productRow(page: Page, productId: string): Locator {
  return page.locator(`[data-testid="product-row"][data-product-id="${productId}"]`);
}

export function printQueueItem(page: Page, productId: string): Locator {
  return page.locator(`[data-testid="print-queue-item"][data-product-id="${productId}"]`);
}

export function adminProductRow(page: Page, productId: string): Locator {
  return page.locator(`[data-testid="admin-product-row"][data-product-id="${productId}"]`);
}

export function bulkProductRow(page: Page, productId: string): Locator {
  return page.locator(`[data-testid="bulk-product-row"][data-product-id="${productId}"]`);
}

export async function openCatalogAdmin(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Edycja cennika' }).click();
  await expect(page.getByRole('heading', { name: 'Cennik produktów' })).toBeVisible();
}

export async function addProductToQueue(page: Page, productId: string): Promise<void> {
  const row = productRow(page, productId);
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: 'Dodaj' }).click();
}

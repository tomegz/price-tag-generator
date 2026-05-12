import { expect, test } from '@playwright/test';
import { login, ownerEmail, ownerPassword } from './helpers';

test.use({ storageState: { cookies: [], origins: [] } });

test('rejects invalid credentials', async ({ page }) => {
  await login(page, 'wrong@example.test', 'bad-password');

  await expect(page.getByRole('alert')).toHaveText('Nieprawidłowy e-mail lub hasło.');
  await expect(page.getByRole('heading', { name: 'Zaloguj się' })).toBeVisible();
});

test('allows owner login and logout', async ({ page }) => {
  await login(page, ownerEmail, ownerPassword);
  await expect(page.getByRole('heading', { name: /Produkty/ })).toBeVisible();

  await page.getByRole('button', { name: `Zalogowany użytkownik ${ownerEmail}` }).click();
  await page.getByRole('menuitem', { name: 'Wyloguj' }).click();

  await expect(page.getByRole('heading', { name: 'Zaloguj się' })).toBeVisible();
});

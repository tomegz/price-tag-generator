import { expect, test } from '@playwright/test';
import { addProductToQueue, gotoApp, printQueueItem, seedItems } from './helpers';

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
});

test('adds, adjusts, removes, and clears print queue items', async ({ page }) => {
  const printButton = page.getByRole('button', { name: /Drukuj/ });
  await expect(printButton).toBeDisabled();
  await expect(page.getByText('Kolejka jest pusta')).toBeVisible();

  await addProductToQueue(page, seedItems.queue);
  await expect(page.getByTestId('print-queue-total')).toHaveText('01');
  await expect(printButton).toBeEnabled();

  const queueItem = printQueueItem(page, seedItems.queue);
  await expect(queueItem).toContainText('Giant Queue Runner');
  await queueItem
    .getByRole('group', { name: /Ilość w kolejce dla Giant/ })
    .getByRole('button', { name: 'Zwiększ' })
    .click();
  await expect(page.getByTestId('print-queue-total')).toHaveText('02');

  await queueItem
    .getByRole('group', { name: /Ilość w kolejce dla Giant/ })
    .getByRole('button', { name: 'Zmniejsz' })
    .click();
  await expect(page.getByTestId('print-queue-total')).toHaveText('01');

  await queueItem.getByRole('button', { name: 'Usuń z kolejki' }).click();
  await expect(page.getByText('Kolejka jest pusta')).toBeVisible();
  await expect(printButton).toBeDisabled();

  await addProductToQueue(page, seedItems.queue);
  await page.getByRole('button', { name: 'Wyczyść' }).click();
  await expect(page.getByText('Kolejka jest pusta')).toBeVisible();
});

test('renders print tags and calls window.print', async ({ page }) => {
  await page.addInitScript(() => {
    const testWindow = window as typeof window & { __printCalls: number };
    testWindow.__printCalls = 0;
    window.print = () => {
      testWindow.__printCalls += 1;
    };
  });

  await gotoApp(page);
  await addProductToQueue(page, seedItems.queue);
  await printQueueItem(page, seedItems.queue)
    .getByRole('group', { name: /Ilość w kolejce dla Giant/ })
    .getByRole('button', { name: 'Zwiększ' })
    .click();

  await expect(page.getByTestId('print-tag')).toHaveCount(2);
  await page.getByRole('button', { name: /Drukuj/ }).click();

  await expect
    .poll(() =>
      page.evaluate(() => {
        const testWindow = window as typeof window & { __printCalls?: number };
        return testWindow.__printCalls ?? 0;
      })
    )
    .toBe(1);
});

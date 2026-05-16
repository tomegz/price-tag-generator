import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from './App';
import type { AuthService, CatalogRepository } from '@/services/firebase';
import type { StorageLike } from '@/domains/storage/printQueueStorage';
import { createTestObservability } from '@/test/observability';

it('renders login screen without crashing', async () => {
  render(<App />);
  expect(await screen.findByRole('heading', { name: /Zaloguj się/i })).toBeInTheDocument();
});

it('tracks screen changes and print workflow events', async () => {
  const user = userEvent.setup();
  const observability = createTestObservability();
  const print = vi.fn();
  const auth: AuthService = {
    observeAuth: vi.fn(callback => {
      callback({ displayName: null, email: 'owner@example.test', uid: 'owner' });
      return vi.fn();
    }),
    signIn: vi.fn(async () => undefined),
    signOut: vi.fn(async () => undefined)
  };
  const catalog: CatalogRepository = {
    deleteCatalogItem: vi.fn(async () => undefined),
    deleteCatalogItems: vi.fn(async () => undefined),
    saveCatalogItem: vi.fn(async () => undefined),
    saveCatalogItems: vi.fn(async () => undefined),
    subscribeCatalogBrands: vi.fn(handlers => {
      handlers.next(['KTM']);
      return vi.fn();
    }),
    subscribeCatalogItems: vi.fn(handlers => {
      handlers.next({
        item1: {
          brand: 'KTM',
          discountPrice: 0,
          discountEnabled: false,
          id: 'item1',
          model: 'Scarp',
          price: 12999,
          year: 2026
        }
      });
      return vi.fn();
    })
  };
  const storage: StorageLike = {
    getItem: vi.fn(() => null),
    removeItem: vi.fn(),
    setItem: vi.fn()
  };

  render(
    <App
      auth={auth}
      catalog={catalog}
      observability={observability}
      print={print}
      storage={storage}
    />
  );

  expect(await screen.findByText('Scarp')).toBeInTheDocument();
  await waitFor(() => {
    expect(observability.trackEvent).toHaveBeenCalledWith('screen_view', { screen: 'print' });
  });

  await user.click(within(screen.getByTestId('product-row')).getByRole('button', { name: /Dodaj/i }));
  expect(observability.trackEvent).toHaveBeenCalledWith('print_queue_add', {
    quantity: 1,
    queue_item_count: 1,
    total_tag_count: 1
  });

  await user.click(screen.getByRole('button', { name: /Drukuj/i }));

  expect(print).toHaveBeenCalledTimes(1);
  expect(observability.trackEvent).toHaveBeenCalledWith('print_started', {
    queue_item_count: 1,
    total_tag_count: 1
  });

  await user.click(screen.getByRole('button', { name: /Edycja cennika/i }));

  await waitFor(() => {
    expect(observability.trackEvent).toHaveBeenCalledWith('screen_view', { screen: 'admin' });
  });
});

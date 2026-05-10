import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AuthUser } from "../../app/authUser";
import type { CatalogBrands, CatalogItemsById } from "../../domains/catalog/catalog";
import type {
  CatalogReadRepository,
  FirebaseRepositoryError
} from "../../services/firebase";
import { createTestObservability } from "../../test/observability";
import { useCatalog } from "./useCatalog";

type SubscriptionHandlers<T> = {
  next(value: T): void;
  error?(error: FirebaseRepositoryError): void;
};

function createCatalogRepository() {
  let itemHandlers: SubscriptionHandlers<CatalogItemsById> | null = null;
  let brandHandlers: SubscriptionHandlers<CatalogBrands> | null = null;
  const unsubscribeItems = vi.fn();
  const unsubscribeBrands = vi.fn();
  const repository: CatalogReadRepository = {
    subscribeCatalogBrands: vi.fn(handlers => {
      brandHandlers = handlers;
      return unsubscribeBrands;
    }),
    subscribeCatalogItems: vi.fn(handlers => {
      itemHandlers = handlers;
      return unsubscribeItems;
    })
  };

  return {
    emitBrands(brands: CatalogBrands) {
      act(() => brandHandlers?.next(brands));
    },
    emitItems(items: CatalogItemsById) {
      act(() => itemHandlers?.next(items));
    },
    failItems(error: FirebaseRepositoryError) {
      act(() => itemHandlers?.error?.(error));
    },
    repository,
    unsubscribeBrands,
    unsubscribeItems
  };
}

const user: AuthUser = { displayName: null, email: "owner@example.test", uid: "owner" };

const item = {
  discountPrice: 0,
  discountStatus: "off" as const,
  model: "Scarp",
  name: "KTM",
  price: 12999,
  year: 2026
};

describe("useCatalog", () => {
  it("subscribes after login and derives products and brands", () => {
    const { emitBrands, emitItems, repository, unsubscribeBrands, unsubscribeItems } =
      createCatalogRepository();
    const observability = createTestObservability();
    const { result, rerender, unmount } = renderHook(
      ({ currentUser }) => useCatalog(currentUser, repository, observability),
      { initialProps: { currentUser: null as AuthUser | null } }
    );

    expect(result.current.catalogLoading).toBe(false);
    expect(result.current.products).toEqual([]);
    expect(repository.subscribeCatalogItems).not.toHaveBeenCalled();

    rerender({ currentUser: user });

    expect(result.current.catalogLoading).toBe(true);
    expect(repository.subscribeCatalogItems).toHaveBeenCalledTimes(1);
    expect(repository.subscribeCatalogBrands).toHaveBeenCalledTimes(1);

    emitItems({ item1: item });
    emitBrands(["KTM", "Trek"]);

    expect(observability.trackEvent).toHaveBeenCalledWith("catalog_load_success", {
      item_count: 1
    });
    expect(result.current.catalogLoading).toBe(false);
    expect(result.current.catalogItems).toEqual({ item1: item });
    expect(result.current.products).toEqual([
      {
        brand: "KTM",
        discountPrice: 0,
        discountStatus: "off",
        id: "item1",
        model: "Scarp",
        name: "KTM",
        price: 12999,
        year: 2026,
        yearLabel: "2026"
      }
    ]);
    expect(result.current.brands).toEqual(["KTM", "Trek"]);

    rerender({ currentUser: null });

    expect(result.current.catalogError).toBe("");
    expect(result.current.catalogItems).toEqual({});
    expect(result.current.products).toEqual([]);
    expect(result.current.brands).toEqual([]);
    expect(unsubscribeItems).toHaveBeenCalledTimes(1);
    expect(unsubscribeBrands).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("maps permission errors to the catalog access message", () => {
    const { failItems, repository } = createCatalogRepository();
    const observability = createTestObservability();
    const { result } = renderHook(() => useCatalog(user, repository, observability));
    const error: FirebaseRepositoryError = {
      cause: null,
      code: "PERMISSION_DENIED",
      message: "Permission denied"
    };

    failItems(error);

    expect(result.current.catalogLoading).toBe(false);
    expect(result.current.catalogError).toBe(
      "Brak dostępu do katalogu. Zalogowany użytkownik nie ma uprawnień do tej bazy."
    );
    expect(observability.trackEvent).toHaveBeenCalledWith("catalog_load_failure", {
      error_code: "PERMISSION_DENIED"
    });
    expect(observability.captureError).toHaveBeenCalledWith(error, {
      operation: "catalog.subscribe_items",
      params: {
        error_code: "PERMISSION_DENIED"
      }
    });
  });
});

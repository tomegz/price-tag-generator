import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AuthUser } from "../../app/authUser";
import { printQueueStorageKey, type StorageLike } from "../../domains/storage/printQueueStorage";
import { usePrintQueue } from "./usePrintQueue";

type TestStorage = StorageLike & {
  values: Record<string, string>;
};

function createStorage(initialValues: Record<string, string> = {}): TestStorage {
  const values = { ...initialValues };

  return {
    getItem: vi.fn(key => values[key] ?? null),
    removeItem: vi.fn(key => {
      delete values[key];
    }),
    setItem: vi.fn((key, value) => {
      values[key] = value;
    }),
    values
  };
}

const user: AuthUser = { displayName: null, email: "owner@example.test", uid: "owner" };

describe("usePrintQueue", () => {
  it("loads from injected storage and persists only after a user is present", () => {
    const storage = createStorage({
      [printQueueStorageKey]: JSON.stringify({ item1: 2 })
    });
    const { result, rerender } = renderHook(
      ({ currentUser }) => usePrintQueue(currentUser, storage),
      { initialProps: { currentUser: null as AuthUser | null } }
    );

    expect(storage.getItem).toHaveBeenCalledWith(printQueueStorageKey);
    expect(result.current.printQueue).toEqual({ item1: 2 });

    act(() => {
      result.current.addToPrintQueue("item2", 1);
    });

    expect(result.current.printQueue).toEqual({ item1: 2, item2: 1 });
    expect(storage.setItem).not.toHaveBeenCalled();

    rerender({ currentUser: user });

    act(() => {
      result.current.setPrintQueueQuantity("item1", 3);
    });

    expect(storage.setItem).toHaveBeenLastCalledWith(
      printQueueStorageKey,
      JSON.stringify({ item1: 3, item2: 1 })
    );
  });

  it("removes and clears queued items through the same storage adapter", () => {
    const storage = createStorage({
      [printQueueStorageKey]: JSON.stringify({ item1: 2, item2: 4 })
    });
    const { result } = renderHook(() => usePrintQueue(user, storage));

    act(() => {
      result.current.removeFromPrintQueue("item1");
    });

    expect(result.current.printQueue).toEqual({ item2: 4 });
    expect(storage.setItem).toHaveBeenLastCalledWith(
      printQueueStorageKey,
      JSON.stringify({ item2: 4 })
    );

    act(() => {
      result.current.clearPrintQueue();
    });

    expect(result.current.printQueue).toEqual({});
    expect(storage.setItem).toHaveBeenLastCalledWith(printQueueStorageKey, "{}");
  });
});

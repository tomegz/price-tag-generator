import { useCallback, useEffect, useRef, useState } from "react";
import type { AuthUser } from "../../app/authUser";
import {
  addToPrintQueue as addToPrintQueueState,
  clearPrintQueue as clearPrintQueueState,
  removeFromPrintQueue as removeFromPrintQueueState,
  type PrintQueue as PrintQueueState
} from "../../domains/printQueue/printQueue";
import {
  loadPrintQueueFromStorage,
  savePrintQueueToStorage,
  type StorageLike
} from "../../domains/storage/printQueueStorage";

export type PrintQueueActions = {
  addToPrintQueue(itemId: string, quantity: number): void;
  clearPrintQueue(): void;
  printQueue: PrintQueueState;
  removeFromPrintQueue(itemId: string): void;
  setPrintQueueQuantity(itemId: string, quantity: number): void;
};

export function usePrintQueue(
  currentUser: AuthUser | null,
  storage: StorageLike
): PrintQueueActions {
  const [printQueue, setPrintQueue] = useState<PrintQueueState>(() => loadPrintQueueFromStorage(storage));
  const shouldPersistPrintQueueRef = useRef(false);

  useEffect(() => {
    shouldPersistPrintQueueRef.current = Boolean(currentUser);
  }, [currentUser]);

  useEffect(() => {
    if (!shouldPersistPrintQueueRef.current) return;
    savePrintQueueToStorage(storage, printQueue);
  }, [printQueue, storage]);

  const addToPrintQueue = useCallback((itemId: string, quantity: number) => {
    setPrintQueue(currentQueue => addToPrintQueueState(currentQueue, itemId, quantity));
  }, []);

  const setPrintQueueQuantity = useCallback((itemId: string, quantity: number) => {
    setPrintQueue(currentQueue => {
      if (quantity <= 0) return removeFromPrintQueueState(currentQueue, itemId);
      return {
        ...currentQueue,
        [itemId]: Math.floor(quantity)
      };
    });
  }, []);

  const removeFromPrintQueue = useCallback((itemId: string) => {
    setPrintQueue(currentQueue => removeFromPrintQueueState(currentQueue, itemId));
  }, []);

  const clearPrintQueue = useCallback(() => {
    setPrintQueue(clearPrintQueueState());
  }, []);

  return {
    addToPrintQueue,
    clearPrintQueue,
    printQueue,
    removeFromPrintQueue,
    setPrintQueueQuantity
  };
}

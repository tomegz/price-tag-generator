import { useCallback, useEffect, useRef, useState } from "react";
import type { AuthUser } from "@/domains/auth/authUser";
import {
  addToPrintQueue as addToPrintQueueState,
  clearPrintQueue as clearPrintQueueState,
  removeFromPrintQueue as removeFromPrintQueueState,
  type PrintQueue as PrintQueueState
} from "@/domains/printQueue/printQueue";
import {
  loadPrintQueueFromStorage,
  savePrintQueueToStorage,
  type StorageLike
} from "@/domains/storage/printQueueStorage";
import {
  observability as defaultObservability,
  type ObservabilityService,
  workflowTelemetry
} from "@/services/observability";

export type PrintQueueActions = {
  addToPrintQueue(itemId: string, quantity: number): void;
  clearPrintQueue(): void;
  printQueue: PrintQueueState;
  removeFromPrintQueue(itemId: string): void;
  setPrintQueueQuantity(itemId: string, quantity: number): void;
};

export function usePrintQueue(
  currentUser: AuthUser | null,
  storage: StorageLike,
  observability: ObservabilityService = defaultObservability
): PrintQueueActions {
  const [printQueue, setPrintQueue] = useState<PrintQueueState>(() => loadPrintQueueFromStorage(storage));
  const printQueueRef = useRef(printQueue);
  const shouldPersistPrintQueueRef = useRef(false);

  useEffect(() => {
    printQueueRef.current = printQueue;
  }, [printQueue]);

  useEffect(() => {
    shouldPersistPrintQueueRef.current = Boolean(currentUser);
  }, [currentUser]);

  useEffect(() => {
    if (!shouldPersistPrintQueueRef.current) return;
    savePrintQueueToStorage(storage, printQueue);
  }, [printQueue, storage]);

  const addToPrintQueue = useCallback((itemId: string, quantity: number) => {
    const nextQueue = addToPrintQueueState(printQueueRef.current, itemId, quantity);
    printQueueRef.current = nextQueue;
    setPrintQueue(nextQueue);
    workflowTelemetry.trackPrintQueueAdd(observability, quantity, nextQueue);
  }, [observability]);

  const setPrintQueueQuantity = useCallback((itemId: string, quantity: number) => {
    const nextQueue = quantity <= 0
      ? removeFromPrintQueueState(printQueueRef.current, itemId)
      : {
          ...printQueueRef.current,
          [itemId]: Math.floor(quantity)
    };
    printQueueRef.current = nextQueue;
    setPrintQueue(nextQueue);
    workflowTelemetry.trackPrintQueueQuantityChange(observability, quantity, nextQueue);
  }, [observability]);

  const removeFromPrintQueue = useCallback((itemId: string) => {
    const nextQueue = removeFromPrintQueueState(printQueueRef.current, itemId);
    printQueueRef.current = nextQueue;
    setPrintQueue(nextQueue);
    workflowTelemetry.trackPrintQueueRemove(observability, nextQueue);
  }, [observability]);

  const clearPrintQueue = useCallback(() => {
    const previousQueue = printQueueRef.current;
    const nextQueue = clearPrintQueueState();
    printQueueRef.current = nextQueue;
    setPrintQueue(nextQueue);
    workflowTelemetry.trackPrintQueueClear(observability, previousQueue);
  }, [observability]);

  return {
    addToPrintQueue,
    clearPrintQueue,
    printQueue,
    removeFromPrintQueue,
    setPrintQueueQuantity
  };
}

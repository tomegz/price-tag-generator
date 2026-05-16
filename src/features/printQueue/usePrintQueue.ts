import { useCallback, useEffect, useReducer } from "react";
import type { AuthUser } from "../../domains/auth/authUser";
import {
  addToPrintQueue as addToPrintQueueState,
  clearPrintQueue as clearPrintQueueState,
  removeFromPrintQueue as removeFromPrintQueueState,
  setPrintQueueItemQuantity,
  type PrintQueue as PrintQueueState
} from "../../domains/printQueue/printQueue";
import {
  loadPrintQueueFromStorage,
  savePrintQueueToStorage,
  type StorageLike
} from "../../domains/storage/printQueueStorage";
import {
  observability as defaultObservability,
  type ObservabilityService,
  workflowTelemetry
} from "../../services/observability";

export type PrintQueueActions = {
  addToPrintQueue(itemId: string, quantity: number): void;
  clearPrintQueue(): void;
  printQueue: PrintQueueState;
  removeFromPrintQueue(itemId: string): void;
  setPrintQueueQuantity(itemId: string, quantity: number): void;
};

type PrintQueueTelemetryEventPayload =
  | {
      printQueue: PrintQueueState;
      quantity: number;
      type: "add";
    }
  | {
      printQueue: PrintQueueState;
      quantity: number;
      type: "quantity-change";
    }
  | {
      printQueue: PrintQueueState;
      type: "remove";
    }
  | {
      previousPrintQueue: PrintQueueState;
      type: "clear";
    };

type PrintQueueTelemetryEvent = PrintQueueTelemetryEventPayload & { id: number };

type PrintQueuePersistenceRequest = {
  id: number;
  printQueue: PrintQueueState;
};

type PrintQueueReducerState = {
  canPersist: boolean;
  nextPersistenceRequestId: number;
  nextTelemetryEventId: number;
  pendingPersistence: PrintQueuePersistenceRequest | null;
  printQueue: PrintQueueState;
  telemetryEvents: PrintQueueTelemetryEvent[];
};

type PrintQueueReducerAction =
  | { itemId: string; quantity: number; type: "add" }
  | { itemId: string; quantity: number; type: "set-quantity" }
  | { itemId: string; type: "remove" }
  | { type: "clear" }
  | { canPersist: boolean; type: "session-changed" }
  | { flushedRequestId: number; type: "persistence-flushed" }
  | { flushedThroughEventId: number; type: "telemetry-flushed" };

type PrintQueueInitialStateOptions = {
  canPersist: boolean;
  storage: StorageLike;
};

function createInitialPrintQueueState({
  canPersist,
  storage
}: PrintQueueInitialStateOptions): PrintQueueReducerState {
  const printQueue = loadPrintQueueFromStorage(storage);

  return {
    canPersist,
    nextPersistenceRequestId: canPersist ? 2 : 1,
    nextTelemetryEventId: 1,
    pendingPersistence: canPersist ? { id: 1, printQueue } : null,
    printQueue,
    telemetryEvents: []
  };
}

function appendTelemetryEvent(
  state: PrintQueueReducerState,
  event: PrintQueueTelemetryEventPayload
): Pick<PrintQueueReducerState, "nextTelemetryEventId" | "telemetryEvents"> {
  return {
    nextTelemetryEventId: state.nextTelemetryEventId + 1,
    telemetryEvents: [
      ...state.telemetryEvents,
      {
        ...event,
        id: state.nextTelemetryEventId
      }
    ]
  };
}

function queueStateChange(
  state: PrintQueueReducerState,
  printQueue: PrintQueueState,
  telemetryEvent: PrintQueueTelemetryEventPayload
): PrintQueueReducerState {
  const shouldPersist = state.canPersist && printQueue !== state.printQueue;

  return {
    ...state,
    ...appendTelemetryEvent(state, telemetryEvent),
    nextPersistenceRequestId: shouldPersist
      ? state.nextPersistenceRequestId + 1
      : state.nextPersistenceRequestId,
    pendingPersistence: shouldPersist
      ? {
          id: state.nextPersistenceRequestId,
          printQueue
        }
      : state.pendingPersistence,
    printQueue
  };
}

function printQueueReducer(
  state: PrintQueueReducerState,
  action: PrintQueueReducerAction
): PrintQueueReducerState {
  switch (action.type) {
    case "add": {
      const printQueue = addToPrintQueueState(state.printQueue, action.itemId, action.quantity);
      return queueStateChange(state, printQueue, {
        printQueue,
        quantity: action.quantity,
        type: "add"
      });
    }
    case "set-quantity": {
      const printQueue = setPrintQueueItemQuantity(state.printQueue, action.itemId, action.quantity);
      return queueStateChange(state, printQueue, {
        printQueue,
        quantity: action.quantity,
        type: "quantity-change"
      });
    }
    case "remove": {
      const printQueue = removeFromPrintQueueState(state.printQueue, action.itemId);
      return queueStateChange(state, printQueue, {
        printQueue,
        type: "remove"
      });
    }
    case "clear": {
      const previousPrintQueue = state.printQueue;
      const printQueue = clearPrintQueueState();
      return queueStateChange(state, printQueue, {
        previousPrintQueue,
        type: "clear"
      });
    }
    case "session-changed":
      return state.canPersist === action.canPersist
        ? state
        : {
            ...state,
            canPersist: action.canPersist
          };
    case "persistence-flushed":
      return state.pendingPersistence?.id === action.flushedRequestId
        ? {
            ...state,
            pendingPersistence: null
          }
        : state;
    case "telemetry-flushed":
      return {
        ...state,
        telemetryEvents: state.telemetryEvents.filter(event => event.id > action.flushedThroughEventId)
      };
    default:
      return state;
  }
}

function trackPrintQueueTelemetryEvent(
  observability: ObservabilityService,
  event: PrintQueueTelemetryEvent
): void {
  switch (event.type) {
    case "add":
      workflowTelemetry.trackPrintQueueAdd(observability, event.quantity, event.printQueue);
      return;
    case "quantity-change":
      workflowTelemetry.trackPrintQueueQuantityChange(observability, event.quantity, event.printQueue);
      return;
    case "remove":
      workflowTelemetry.trackPrintQueueRemove(observability, event.printQueue);
      return;
    case "clear":
      workflowTelemetry.trackPrintQueueClear(observability, event.previousPrintQueue);
  }
}

export function usePrintQueue(
  currentUser: AuthUser | null,
  storage: StorageLike,
  observability: ObservabilityService = defaultObservability
): PrintQueueActions {
  const [state, dispatch] = useReducer(
    printQueueReducer,
    { canPersist: Boolean(currentUser), storage },
    createInitialPrintQueueState
  );

  useEffect(() => {
    dispatch({ canPersist: Boolean(currentUser), type: "session-changed" });
  }, [currentUser]);

  useEffect(() => {
    const pendingPersistence = state.pendingPersistence;
    if (!pendingPersistence) return;

    savePrintQueueToStorage(storage, pendingPersistence.printQueue);
    dispatch({ flushedRequestId: pendingPersistence.id, type: "persistence-flushed" });
  }, [state.pendingPersistence, storage]);

  useEffect(() => {
    const events = state.telemetryEvents;
    if (events.length === 0) return;

    events.forEach(event => {
      trackPrintQueueTelemetryEvent(observability, event);
    });

    dispatch({
      flushedThroughEventId: events[events.length - 1].id,
      type: "telemetry-flushed"
    });
  }, [observability, state.telemetryEvents]);

  const addToPrintQueue = useCallback((itemId: string, quantity: number) => {
    dispatch({ itemId, quantity, type: "add" });
  }, []);

  const setPrintQueueQuantity = useCallback((itemId: string, quantity: number) => {
    dispatch({ itemId, quantity, type: "set-quantity" });
  }, []);

  const removeFromPrintQueue = useCallback((itemId: string) => {
    dispatch({ itemId, type: "remove" });
  }, []);

  const clearPrintQueue = useCallback(() => {
    dispatch({ type: "clear" });
  }, []);

  return {
    addToPrintQueue,
    clearPrintQueue,
    printQueue: state.printQueue,
    removeFromPrintQueue,
    setPrintQueueQuantity
  };
}

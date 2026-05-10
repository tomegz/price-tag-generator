import type { FirebaseServiceInstances } from "../firebase";

import { createBrowserObservabilityService, countTelemetryItems } from "./browserObservability";
import { readObservabilityConfig } from "./config";
import { createNoopObservabilityService } from "./noop";
import { observability, setObservabilityService } from "./singleton";

export { ObservabilityErrorBoundary } from "./ErrorBoundary";
export { countTelemetryItems, createBrowserObservabilityService };
export { readObservabilityConfig } from "./config";
export { createNoopObservabilityService };
export { observability };
export type {
  ErrorContext,
  ObservabilityEventName,
  ObservabilityService,
  ObservabilityUser,
  TelemetryParams
} from "./types";

export function initializeObservability(firebaseServices: FirebaseServiceInstances): void {
  const config = readObservabilityConfig(import.meta.env, {
    useFirebaseEmulators: firebaseServices.runtimeConfig.useEmulators
  });

  setObservabilityService(createBrowserObservabilityService(firebaseServices.app, config));
}

import type { FirebaseServiceInstances } from "../firebase";

import { countTelemetryItems } from "./countTelemetryItems";
import { readObservabilityConfig } from "./config";
import { createNoopObservabilityService } from "./noop";
import { observability, setObservabilityService } from "./singleton";

export { ObservabilityErrorBoundary } from "./ErrorBoundary";
export { countTelemetryItems };
export { readObservabilityConfig } from "./config";
export { createNoopObservabilityService };
export { observability };
export { workflowTelemetry } from "./workflowTelemetry";
export type {
  ErrorContext,
  ObservabilityEventName,
  ObservabilityService,
  ObservabilityUser,
  TelemetryParams
} from "./types";

export async function initializeObservability(firebaseServices: FirebaseServiceInstances): Promise<void> {
  const config = readObservabilityConfig(import.meta.env, {
    useFirebaseEmulators: firebaseServices.runtimeConfig.useEmulators
  });

  if (!config.analyticsEnabled && !config.sentryEnabled) {
    setObservabilityService(createNoopObservabilityService());
    return;
  }

  const { createBrowserObservabilityService } = await import("./browserObservability");
  setObservabilityService(createBrowserObservabilityService(firebaseServices.app, config));
}

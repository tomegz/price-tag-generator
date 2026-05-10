import type { ObservabilityService } from "./types";

export function createNoopObservabilityService(): ObservabilityService {
  return {
    identifyUser() {
      return undefined;
    },
    clearUser() {
      return undefined;
    },
    trackEvent() {
      return undefined;
    },
    captureError() {
      return undefined;
    },
    addBreadcrumb() {
      return undefined;
    }
  };
}

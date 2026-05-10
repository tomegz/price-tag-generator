import { createNoopObservabilityService } from "./noop";
import type { ObservabilityService } from "./types";

let activeObservabilityService = createNoopObservabilityService();

export const observability: ObservabilityService = {
  identifyUser(user) {
    activeObservabilityService.identifyUser(user);
  },
  clearUser() {
    activeObservabilityService.clearUser();
  },
  trackEvent(name, params) {
    activeObservabilityService.trackEvent(name, params);
  },
  captureError(error, context) {
    activeObservabilityService.captureError(error, context);
  },
  addBreadcrumb(category, message, data) {
    activeObservabilityService.addBreadcrumb(category, message, data);
  }
};

export function setObservabilityService(service: ObservabilityService): void {
  activeObservabilityService = service;
}

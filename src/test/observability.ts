import { vi } from "vitest";
import type { ObservabilityService } from "@/services/observability";

export function createTestObservability(): ObservabilityService {
  return {
    identifyUser: vi.fn(),
    clearUser: vi.fn(),
    trackEvent: vi.fn(),
    captureError: vi.fn(),
    addBreadcrumb: vi.fn()
  };
}

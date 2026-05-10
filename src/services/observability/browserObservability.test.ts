import type { FirebaseApp } from "firebase/app";
import type { Analytics } from "firebase/analytics";
import { describe, expect, it, vi } from "vitest";

import type { ObservabilityConfig } from "./config";
import { createBrowserObservabilityService } from "./browserObservability";

const app = {} as FirebaseApp;
const analytics = {} as Analytics;

const config: ObservabilityConfig = {
  analyticsEnabled: true,
  firebaseMeasurementId: "G-TEST",
  sentryDsn: "https://example@sentry.io/1",
  sentryEnabled: true,
  sentryEnvironment: "production",
  sentryReplayErrorSampleRate: 1,
  sentryReplaySessionSampleRate: 0.05,
  sentryTracesSampleRate: 0.1
};

function createDependencies() {
  const browserTracingIntegration = vi.fn(() => ({ name: "BrowserTracing" }));
  const replayIntegration = vi.fn(() => ({ name: "Replay" }));

  return {
    analytics: {
      getAnalytics: vi.fn(() => analytics),
      isSupported: vi.fn(async () => true),
      logEvent: vi.fn(),
      setAnalyticsCollectionEnabled: vi.fn(),
      setUserId: vi.fn()
    },
    sentry: {
      addBreadcrumb: vi.fn(),
      browserTracingIntegration,
      captureException: vi.fn(),
      init: vi.fn(),
      replayIntegration,
      setUser: vi.fn()
    }
  };
}

function asDependencies(dependencies: ReturnType<typeof createDependencies>) {
  return dependencies as unknown as NonNullable<Parameters<typeof createBrowserObservabilityService>[2]>;
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("createBrowserObservabilityService", () => {
  it("is a no-op when analytics and Sentry are disabled", () => {
    const dependencies = createDependencies();
    const service = createBrowserObservabilityService(
      app,
      {
        ...config,
        analyticsEnabled: false,
        sentryDsn: "",
        sentryEnabled: false
      },
      asDependencies(dependencies)
    );

    service.identifyUser({ uid: "owner" });
    service.trackEvent("login_success");
    service.captureError(new Error("boom"), { operation: "test" });

    expect(dependencies.sentry.init).not.toHaveBeenCalled();
    expect(dependencies.analytics.getAnalytics).not.toHaveBeenCalled();
  });

  it("initializes Sentry with privacy-safe tracing and replay defaults", () => {
    const dependencies = createDependencies();

    createBrowserObservabilityService(app, config, asDependencies(dependencies));

    expect(dependencies.sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://example@sentry.io/1",
        environment: "production",
        replaysOnErrorSampleRate: 1,
        replaysSessionSampleRate: 0.05,
        sendDefaultPii: false,
        tracesSampleRate: 0.1
      })
    );
    expect(dependencies.sentry.browserTracingIntegration).toHaveBeenCalledWith();
    expect(dependencies.sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        tracePropagationTargets: []
      })
    );
    expect(dependencies.sentry.replayIntegration).toHaveBeenCalledWith({
      blockAllMedia: true,
      maskAllInputs: true,
      maskAllText: true,
      networkCaptureBodies: false,
      networkDetailAllowUrls: []
    });
  });

  it("uses Firebase UID only for user identity", async () => {
    const dependencies = createDependencies();
    const service = createBrowserObservabilityService(app, config, asDependencies(dependencies));

    service.identifyUser({ uid: "owner" });
    await flushPromises();

    expect(dependencies.sentry.setUser).toHaveBeenCalledWith({ id: "owner" });
    expect(dependencies.analytics.setUserId).toHaveBeenCalledWith(analytics, "owner");

    service.clearUser();
    await flushPromises();

    expect(dependencies.sentry.setUser).toHaveBeenCalledWith(null);
    expect(dependencies.analytics.setUserId).toHaveBeenCalledWith(analytics, null);
  });

  it("tracks sanitized events in Firebase Analytics and Sentry breadcrumbs", async () => {
    const dependencies = createDependencies();
    const service = createBrowserObservabilityService(app, config, asDependencies(dependencies));

    service.trackEvent("print_started", {
      email: "owner@example.test",
      product_name: "KTM Scarp",
      queue_item_count: 2,
      total_tag_count: 4
    });
    await flushPromises();

    const expectedParams = {
      queue_item_count: 2,
      total_tag_count: 4
    };
    expect(dependencies.sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: "workflow",
      data: expectedParams,
      level: "info",
      message: "print_started"
    });
    expect(dependencies.analytics.logEvent).toHaveBeenCalledWith(
      analytics,
      "print_started",
      expectedParams
    );
  });

  it("captures errors with sanitized context only", () => {
    const dependencies = createDependencies();
    const service = createBrowserObservabilityService(app, config, asDependencies(dependencies));
    const error = new Error("write failed");

    service.captureError(error, {
      operation: "catalog.update",
      params: {
        error_code: "PERMISSION_DENIED",
        price: 1234
      }
    });

    expect(dependencies.sentry.captureException).toHaveBeenCalledWith(error, {
      contexts: {
        workflow: {
          error_code: "PERMISSION_DENIED",
          operation: "catalog.update"
        }
      },
      tags: {
        operation: "catalog.update"
      }
    });
  });
});

import type { FirebaseApp } from "firebase/app";
import {
  getAnalytics,
  isSupported,
  logEvent,
  setAnalyticsCollectionEnabled,
  setUserId,
  type Analytics
} from "firebase/analytics";
import * as Sentry from "@sentry/react";

import type { ObservabilityConfig } from "./config";
import { createNoopObservabilityService } from "./noop";
import {
  sanitizeTelemetryParams,
  sanitizeTelemetryUrl
} from "./sanitize";
import type {
  ObservabilityEventName,
  ObservabilityService,
  ObservabilityUser,
  TelemetryParams
} from "./types";

type SentryAdapter = {
  addBreadcrumb: typeof Sentry.addBreadcrumb;
  browserTracingIntegration: typeof Sentry.browserTracingIntegration;
  captureException: typeof Sentry.captureException;
  init: typeof Sentry.init;
  replayIntegration: typeof Sentry.replayIntegration;
  setUser: typeof Sentry.setUser;
};

type AnalyticsAdapter = {
  getAnalytics: typeof getAnalytics;
  isSupported: typeof isSupported;
  logEvent: typeof logEvent;
  setAnalyticsCollectionEnabled: typeof setAnalyticsCollectionEnabled;
  setUserId: typeof setUserId;
};

type BrowserObservabilityDependencies = {
  analytics: AnalyticsAdapter;
  sentry: SentryAdapter;
};

const defaultDependencies: BrowserObservabilityDependencies = {
  analytics: {
    getAnalytics,
    isSupported,
    logEvent,
    setAnalyticsCollectionEnabled,
    setUserId
  },
  sentry: Sentry
};

export function createBrowserObservabilityService(
  app: FirebaseApp,
  config: ObservabilityConfig,
  dependencies = defaultDependencies
): ObservabilityService {
  if (!config.analyticsEnabled && !config.sentryEnabled) {
    return createNoopObservabilityService();
  }

  if (config.sentryEnabled) {
    dependencies.sentry.init({
      dsn: config.sentryDsn,
      environment: config.sentryEnvironment,
      integrations: [
        dependencies.sentry.browserTracingIntegration(),
        dependencies.sentry.replayIntegration({
          blockAllMedia: true,
          maskAllInputs: true,
          maskAllText: true,
          networkCaptureBodies: false,
          networkDetailAllowUrls: []
        })
      ],
      release: config.sentryRelease,
      replaysOnErrorSampleRate: config.sentryReplayErrorSampleRate,
      replaysSessionSampleRate: config.sentryReplaySessionSampleRate,
      sendDefaultPii: false,
      tracePropagationTargets: [],
      tracesSampleRate: config.sentryTracesSampleRate,
      beforeSend(event) {
        if (event.user) {
          event.user = event.user.id ? { id: String(event.user.id) } : undefined;
        }
        if (event.extra) {
          event.extra = sanitizeTelemetryParams(event.extra as TelemetryParams);
        }
        if (event.contexts?.workflow) {
          event.contexts = {
            ...event.contexts,
            workflow: sanitizeTelemetryParams(event.contexts.workflow as TelemetryParams)
          };
        }
        if (event.request) {
          const url = sanitizeTelemetryUrl(event.request.url);
          event.request = url ? { url } : undefined;
        }

        return event;
      }
    });
  }

  const analyticsPromise = config.analyticsEnabled
    ? createAnalyticsPromise(app, dependencies).catch(error => {
        if (config.sentryEnabled) {
          dependencies.sentry.captureException(error, {
            tags: {
              operation: "analytics.init"
            }
          });
        }
        return null;
      })
    : Promise.resolve<Analytics | null>(null);

  return {
    identifyUser(user) {
      if (config.sentryEnabled) identifySentryUser(user, dependencies);
      void analyticsPromise.then(analytics => {
        if (analytics) dependencies.analytics.setUserId(analytics, user.uid);
      });
    },
    clearUser() {
      if (config.sentryEnabled) dependencies.sentry.setUser(null);
      void analyticsPromise.then(analytics => {
        if (analytics) dependencies.analytics.setUserId(analytics, null);
      });
    },
    trackEvent(name, params) {
      const cleanParams = sanitizeTelemetryParams(params);
      if (config.sentryEnabled) {
        dependencies.sentry.addBreadcrumb({
          category: "workflow",
          data: cleanParams,
          level: "info",
          message: name
        });
      }
      void analyticsPromise.then(analytics => {
        if (analytics) logAnalyticsEvent(dependencies, analytics, name, cleanParams);
      });
    },
    captureError(error, context) {
      const cleanParams = sanitizeTelemetryParams(context.params);
      if (config.sentryEnabled) {
        dependencies.sentry.captureException(error, {
          contexts: {
            workflow: {
              operation: context.operation,
              ...cleanParams
            }
          },
          tags: {
            operation: context.operation
          }
        });
      }
    },
    addBreadcrumb(category, message, data) {
      if (!config.sentryEnabled) return;
      dependencies.sentry.addBreadcrumb({
        category,
        data: sanitizeTelemetryParams(data),
        level: "info",
        message
      });
    }
  };
}

function identifySentryUser(
  user: ObservabilityUser,
  dependencies: BrowserObservabilityDependencies
): void {
  dependencies.sentry.setUser({ id: user.uid });
}

async function createAnalyticsPromise(
  app: FirebaseApp,
  dependencies: BrowserObservabilityDependencies
): Promise<Analytics | null> {
  if (!(await dependencies.analytics.isSupported())) return null;

  const analytics = dependencies.analytics.getAnalytics(app);
  dependencies.analytics.setAnalyticsCollectionEnabled(analytics, true);
  return analytics;
}

function logAnalyticsEvent(
  dependencies: BrowserObservabilityDependencies,
  analytics: Analytics,
  name: ObservabilityEventName,
  params: TelemetryParams
): void {
  const analyticsParams = toAnalyticsParams(params);

  if (name === "screen_view") {
    const screen = String(analyticsParams.screen || "unknown");
    dependencies.analytics.logEvent(analytics, "screen_view", {
      firebase_screen: screen,
      firebase_screen_class: screen
    });
    return;
  }

  dependencies.analytics.logEvent(analytics, name, analyticsParams);
}

function toAnalyticsParams(params: TelemetryParams): Record<string, string | number | boolean> {
  return Object.entries(params).reduce<Record<string, string | number | boolean>>(
    (nextParams, [key, value]) => {
      if (value !== null && value !== undefined) nextParams[key] = value;
      return nextParams;
    },
    {}
  );
}

export type { ObservabilityEventName, ObservabilityService, TelemetryParams };

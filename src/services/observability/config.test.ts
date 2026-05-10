import { describe, expect, it } from "vitest";

import { readObservabilityConfig } from "./config";

describe("readObservabilityConfig", () => {
  it("disables telemetry by default in local emulator development", () => {
    expect(
      readObservabilityConfig(
        {
          MODE: "development",
          VITE_ENABLE_ANALYTICS: "true",
          VITE_FIREBASE_MEASUREMENT_ID: "G-TEST",
          VITE_SENTRY_DSN: "https://example@sentry.io/1"
        },
        { useFirebaseEmulators: true }
      )
    ).toMatchObject({
      analyticsEnabled: false,
      sentryDsn: "",
      sentryEnabled: false
    });
  });

  it("disables telemetry during tests", () => {
    expect(
      readObservabilityConfig({
        MODE: "test",
        VITE_ENABLE_ANALYTICS: "true",
        VITE_FIREBASE_MEASUREMENT_ID: "G-TEST",
        VITE_SENTRY_DSN: "https://example@sentry.io/1"
      })
    ).toMatchObject({
      analyticsEnabled: false,
      sentryEnabled: false
    });
  });

  it("enables analytics and Sentry from production env vars", () => {
    expect(
      readObservabilityConfig({
        MODE: "production",
        VITE_ENABLE_ANALYTICS: "true",
        VITE_FIREBASE_MEASUREMENT_ID: "G-TEST",
        VITE_SENTRY_DSN: "https://example@sentry.io/1",
        VITE_SENTRY_ENVIRONMENT: "production",
        VITE_SENTRY_RELEASE: "price-tag-generator@1",
        VITE_SENTRY_REPLAY_ERROR_SAMPLE_RATE: "0.5",
        VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE: "0.01",
        VITE_SENTRY_TRACES_SAMPLE_RATE: "0.2"
      })
    ).toEqual({
      analyticsEnabled: true,
      firebaseMeasurementId: "G-TEST",
      sentryDsn: "https://example@sentry.io/1",
      sentryEnabled: true,
      sentryEnvironment: "production",
      sentryRelease: "price-tag-generator@1",
      sentryReplayErrorSampleRate: 0.5,
      sentryReplaySessionSampleRate: 0.01,
      sentryTracesSampleRate: 0.2
    });
  });

  it("requires a Firebase measurement ID when analytics are enabled", () => {
    expect(() =>
      readObservabilityConfig({
        MODE: "production",
        VITE_ENABLE_ANALYTICS: "true"
      })
    ).toThrow("VITE_FIREBASE_MEASUREMENT_ID is required");
  });

  it("validates sample rates", () => {
    expect(() =>
      readObservabilityConfig({
        MODE: "production",
        VITE_SENTRY_TRACES_SAMPLE_RATE: "2"
      })
    ).toThrow("Observability sample rates must be numbers between 0 and 1");
  });
});

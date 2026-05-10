type ObservabilityEnv = {
  MODE?: string;
  VITE_ENABLE_ANALYTICS?: string;
  VITE_FIREBASE_MEASUREMENT_ID?: string;
  VITE_SENTRY_DSN?: string;
  VITE_SENTRY_ENVIRONMENT?: string;
  VITE_SENTRY_RELEASE?: string;
  VITE_SENTRY_TRACES_SAMPLE_RATE?: string;
  VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE?: string;
  VITE_SENTRY_REPLAY_ERROR_SAMPLE_RATE?: string;
};

type ObservabilityRuntimeOptions = {
  useFirebaseEmulators?: boolean;
};

export type ObservabilityConfig = {
  analyticsEnabled: boolean;
  firebaseMeasurementId: string;
  sentryDsn: string;
  sentryEnabled: boolean;
  sentryEnvironment: string;
  sentryRelease?: string;
  sentryReplayErrorSampleRate: number;
  sentryReplaySessionSampleRate: number;
  sentryTracesSampleRate: number;
};

export function readObservabilityConfig(
  env: ObservabilityEnv = import.meta.env,
  options: ObservabilityRuntimeOptions = {}
): ObservabilityConfig {
  const telemetryDisabled = Boolean(options.useFirebaseEmulators) || env.MODE === "test";
  const firebaseMeasurementId = env.VITE_FIREBASE_MEASUREMENT_ID || "";
  const analyticsEnabled = !telemetryDisabled && env.VITE_ENABLE_ANALYTICS === "true";

  if (analyticsEnabled && !firebaseMeasurementId) {
    throw new Error("VITE_FIREBASE_MEASUREMENT_ID is required when VITE_ENABLE_ANALYTICS=true.");
  }

  const sentryDsn = telemetryDisabled ? "" : env.VITE_SENTRY_DSN || "";

  return {
    analyticsEnabled,
    firebaseMeasurementId,
    sentryDsn,
    sentryEnabled: Boolean(sentryDsn),
    sentryEnvironment: env.VITE_SENTRY_ENVIRONMENT || env.MODE || "production",
    sentryRelease: env.VITE_SENTRY_RELEASE || undefined,
    sentryReplayErrorSampleRate: readSampleRate(env.VITE_SENTRY_REPLAY_ERROR_SAMPLE_RATE, 1),
    sentryReplaySessionSampleRate: readSampleRate(env.VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE, 0.05),
    sentryTracesSampleRate: readSampleRate(env.VITE_SENTRY_TRACES_SAMPLE_RATE, 0.1)
  };
}

function readSampleRate(value: string | undefined, defaultValue: number): number {
  if (value === undefined || value === "") return defaultValue;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    throw new Error("Observability sample rates must be numbers between 0 and 1.");
  }

  return parsed;
}

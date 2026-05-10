import type { ReactNode } from "react";
import * as Sentry from "@sentry/react";

type ObservabilityErrorBoundaryProps = {
  children: ReactNode;
};

const fallback = (
  <div className="app-loading" role="alert">
    <span className="pb-mono">PROFI BIKE</span>
    <strong>Coś poszło nie tak.</strong>
    <p>Odśwież stronę i spróbuj ponownie.</p>
  </div>
);

export function ObservabilityErrorBoundary({ children }: ObservabilityErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary fallback={fallback} showDialog={false}>
      {children}
    </Sentry.ErrorBoundary>
  );
}

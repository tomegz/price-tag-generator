import { Component, type ErrorInfo, type ReactNode } from "react";

import { observability } from "./singleton";

type ObservabilityErrorBoundaryProps = {
  children: ReactNode;
};

type ObservabilityErrorBoundaryState = {
  hasError: boolean;
};

const fallback = (
  <div className="app-loading" role="alert">
    <span className="pb-mono">PROFI BIKE</span>
    <strong>Coś poszło nie tak.</strong>
    <p>Odśwież stronę i spróbuj ponownie.</p>
  </div>
);

export class ObservabilityErrorBoundary extends Component<
  ObservabilityErrorBoundaryProps,
  ObservabilityErrorBoundaryState
> {
  state: ObservabilityErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(): ObservabilityErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    observability.captureError(error, {
      operation: "react.error_boundary",
      params: {
        component_stack_present: Boolean(errorInfo.componentStack)
      }
    });
  }

  render() {
    if (this.state.hasError) return fallback;
    return this.props.children;
  }
}

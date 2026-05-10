export type TelemetryPrimitive = string | number | boolean | null;

export type TelemetryParams = Record<string, TelemetryPrimitive | undefined>;

export type ObservabilityEventName =
  | "login_success"
  | "login_failure"
  | "logout"
  | "screen_view"
  | "catalog_load_success"
  | "catalog_load_failure"
  | "print_queue_add"
  | "print_queue_remove"
  | "print_queue_clear"
  | "print_queue_quantity_change"
  | "print_started"
  | "catalog_item_create"
  | "catalog_item_update"
  | "catalog_item_delete"
  | "bulk_promotion_apply";

export type ObservabilityUser = {
  uid: string;
};

export type ErrorContext = {
  operation: string;
  params?: TelemetryParams;
};

export type ObservabilityService = {
  identifyUser(user: ObservabilityUser): void;
  clearUser(): void;
  trackEvent(name: ObservabilityEventName, params?: TelemetryParams): void;
  captureError(error: unknown, context: ErrorContext): void;
  addBreadcrumb(category: string, message: string, data?: TelemetryParams): void;
};

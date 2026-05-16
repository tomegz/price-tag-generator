import { describe, expect, it } from "vitest";
import { createTestObservability } from "@/test/observability";
import { workflowTelemetry } from "./workflowTelemetry";

describe("workflowTelemetry", () => {
  it("centralizes catalog load failure event and error context", () => {
    const observability = createTestObservability();
    const cause = new Error("permission denied");

    workflowTelemetry.trackCatalogLoadFailure(observability, "catalog.subscribe_items", {
      cause,
      code: "PERMISSION_DENIED",
      message: "Permission denied"
    });

    expect(observability.trackEvent).toHaveBeenCalledWith("catalog_load_failure", {
      error_code: "PERMISSION_DENIED"
    });
    expect(observability.captureError).toHaveBeenCalledWith(cause, {
      operation: "catalog.subscribe_items",
      params: {
        error_code: "PERMISSION_DENIED"
      }
    });
  });

  it("keeps catalog delete telemetry parameters consistent", () => {
    const observability = createTestObservability();

    workflowTelemetry.trackCatalogItemDelete(observability);
    workflowTelemetry.trackCatalogItemDelete(observability, 3);

    expect(observability.trackEvent).toHaveBeenNthCalledWith(1, "catalog_item_delete");
    expect(observability.trackEvent).toHaveBeenNthCalledWith(2, "catalog_item_delete", {
      item_count: 3
    });
  });

  it("counts print queue telemetry in one place", () => {
    const observability = createTestObservability();

    workflowTelemetry.trackPrintQueueAdd(observability, 2.9, { item1: 2, item2: 1 });
    workflowTelemetry.trackPrintQueueClear(observability, { item1: 2, item2: 1 });

    expect(observability.trackEvent).toHaveBeenNthCalledWith(1, "print_queue_add", {
      quantity: 2,
      queue_item_count: 2,
      total_tag_count: 3
    });
    expect(observability.trackEvent).toHaveBeenNthCalledWith(2, "print_queue_clear", {
      queue_item_count: 2,
      total_tag_count: 3
    });
  });
});

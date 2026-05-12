import { describe, expect, it } from "vitest";

import {
  sanitizeTelemetryParams,
  sanitizeTelemetryUrl
} from "./sanitize";

describe("sanitizeTelemetryParams", () => {
  it("excludes sensitive catalog, identity, search, password, and price fields", () => {
    expect(
      sanitizeTelemetryParams({
        brand: "Kross",
        catalogPayload: "full catalog",
        email: "owner@example.test",
        itemId: "item-123",
        model: "Hexagon",
        password: "password123",
        price: 1299,
        productName: "Kross Hexagon",
        query: "kross",
        searchText: "hexagon",
        queue_item_count: 2,
        total_tag_count: 4
      })
    ).toEqual({
      queue_item_count: 2,
      total_tag_count: 4
    });
  });

  it("drops non-primitive runtime values and truncates retained strings", () => {
    expect(
      sanitizeTelemetryParams({
        operation: "a".repeat(100),
        payload: { unsafe: true } as never,
        safe: true
      })
    ).toEqual({
      operation: "a".repeat(80),
      safe: true
    });
  });
});

describe("sanitizeTelemetryUrl", () => {
  it("removes query strings, hashes, and sensitive path segments", () => {
    expect(
      sanitizeTelemetryUrl(
        "https://example.com/products/item-123/Scarp?q=kross&password=password123#price"
      )
    ).toBe("https://example.com/products/:redacted/Scarp");
  });

  it("drops invalid URLs", () => {
    expect(sanitizeTelemetryUrl("https://[invalid")).toBeUndefined();
  });
});

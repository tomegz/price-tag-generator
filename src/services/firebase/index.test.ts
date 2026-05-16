import { describe, expect, it, vi } from "vitest";

describe("firebase service barrel", () => {
  it("does not initialize Firebase when feature code imports service helpers", async () => {
    vi.resetModules();
    const initializeApp = vi.fn();

    vi.doMock("firebase/app", () => ({
      getApp: vi.fn(),
      getApps: vi.fn(() => []),
      initializeApp
    }));
    vi.doMock("firebase/auth", () => ({
      connectAuthEmulator: vi.fn(),
      getAuth: vi.fn()
    }));
    vi.doMock("firebase/database", () => ({
      get: vi.fn(),
      onValue: vi.fn(),
      ref: vi.fn(),
      remove: vi.fn(),
      set: vi.fn(),
      update: vi.fn()
    }));

    const firebaseExports = await import("./index");

    expect(initializeApp).not.toHaveBeenCalled();
    expect(firebaseExports.toFirebaseRepositoryError({ code: "permission-denied" }).code)
      .toBe("permission-denied");
  });
});

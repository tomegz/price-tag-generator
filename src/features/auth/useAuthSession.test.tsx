import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AuthUser } from "../../app/authUser";
import type { AuthService } from "../../services/firebase";
import { createTestObservability } from "../../test/observability";
import { useAuthSession } from "./useAuthSession";

function createAuthService() {
  let authCallback: (user: AuthUser | null) => void = () => undefined;
  const unsubscribe = vi.fn();
  const service: AuthService = {
    observeAuth: vi.fn(callback => {
      authCallback = callback;
      return unsubscribe;
    }),
    signIn: vi.fn(async () => undefined),
    signOut: vi.fn(async () => undefined)
  };

  return { authCallback: (user: AuthUser | null) => authCallback(user), service, unsubscribe };
}

const user: AuthUser = { displayName: null, email: "owner@example.test", uid: "owner" };

describe("useAuthSession", () => {
  it("subscribes to auth state and exposes the current user", () => {
    const { authCallback, service, unsubscribe } = createAuthService();
    const observability = createTestObservability();
    const { result, unmount } = renderHook(() => useAuthSession(service, observability));

    expect(result.current.authLoading).toBe(true);
    expect(service.observeAuth).toHaveBeenCalledTimes(1);

    act(() => authCallback(user));

    expect(result.current.authLoading).toBe(false);
    expect(result.current.currentUser).toEqual({
      displayName: null,
      email: "owner@example.test",
      uid: "owner"
    });
    expect(observability.identifyUser).toHaveBeenCalledWith({ uid: "owner" });

    act(() => authCallback(null));

    expect(result.current.currentUser).toBe(null);
    expect(observability.clearUser).toHaveBeenCalledTimes(1);

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("maps sign-in failures to the login error message", async () => {
    const { service } = createAuthService();
    const observability = createTestObservability();
    const error = new Error("bad credentials");
    vi.mocked(service.signIn).mockRejectedValueOnce(error);
    const { result } = renderHook(() => useAuthSession(service, observability));

    await act(async () => {
      await result.current.login("owner@example.test", "wrong").catch(() => undefined);
    });

    expect(service.signIn).toHaveBeenCalledWith("owner@example.test", "wrong");
    expect(result.current.authError).toBe("Nieprawidłowy email lub hasło.");
    expect(observability.trackEvent).toHaveBeenCalledWith("login_failure");
    expect(observability.captureError).toHaveBeenCalledWith(error, { operation: "auth.login" });
  });

  it("tracks sign-in success", async () => {
    const { service } = createAuthService();
    const observability = createTestObservability();
    const { result } = renderHook(() => useAuthSession(service, observability));

    await act(async () => {
      await result.current.login("owner@example.test", "password123");
    });

    expect(observability.trackEvent).toHaveBeenCalledWith("login_success");
  });

  it("delegates logout to the auth service", async () => {
    const { service } = createAuthService();
    const observability = createTestObservability();
    const { result } = renderHook(() => useAuthSession(service, observability));

    await act(async () => {
      await result.current.logout();
    });

    expect(service.signOut).toHaveBeenCalledTimes(1);
    expect(observability.trackEvent).toHaveBeenCalledWith("logout");
    expect(observability.clearUser).toHaveBeenCalledTimes(1);
  });
});

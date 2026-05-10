import { act, renderHook } from "@testing-library/react";
import type { User } from "firebase/auth";
import { describe, expect, it, vi } from "vitest";
import type { AuthService, AuthSignInResult } from "../../services/firebase";
import { useAuthSession } from "./useAuthSession";

function createAuthService() {
  let authCallback: (user: User | null) => void = () => undefined;
  const unsubscribe = vi.fn();
  const service: AuthService = {
    observeAuth: vi.fn(callback => {
      authCallback = callback;
      return unsubscribe;
    }),
    signIn: vi.fn(async () => ({}) as AuthSignInResult),
    signOut: vi.fn(async () => undefined)
  };

  return { authCallback: (user: User | null) => authCallback(user), service, unsubscribe };
}

const user = { email: "owner@example.test", uid: "owner" } as User;

describe("useAuthSession", () => {
  it("subscribes to auth state and exposes the current user", () => {
    const { authCallback, service, unsubscribe } = createAuthService();
    const { result, unmount } = renderHook(() => useAuthSession(service));

    expect(result.current.authLoading).toBe(true);
    expect(service.observeAuth).toHaveBeenCalledTimes(1);

    act(() => authCallback(user));

    expect(result.current.authLoading).toBe(false);
    expect(result.current.currentUser).toBe(user);

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("maps sign-in failures to the login error message", async () => {
    const { service } = createAuthService();
    vi.mocked(service.signIn).mockRejectedValueOnce(new Error("bad credentials"));
    const { result } = renderHook(() => useAuthSession(service));

    await act(async () => {
      await result.current.login("owner@example.test", "wrong").catch(() => undefined);
    });

    expect(service.signIn).toHaveBeenCalledWith("owner@example.test", "wrong");
    expect(result.current.authError).toBe("Nieprawidłowy email lub hasło.");
  });

  it("delegates logout to the auth service", async () => {
    const { service } = createAuthService();
    const { result } = renderHook(() => useAuthSession(service));

    await act(async () => {
      await result.current.logout();
    });

    expect(service.signOut).toHaveBeenCalledTimes(1);
  });
});

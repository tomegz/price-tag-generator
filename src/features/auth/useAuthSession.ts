import { useCallback, useEffect, useState } from "react";
import type { AuthUser } from "../../app/authUser";
import type { AuthService } from "../../services/firebase";
import {
  observability as defaultObservability,
  type ObservabilityService
} from "../../services/observability";

export type AuthSession = {
  authError: string;
  authLoading: boolean;
  currentUser: AuthUser | null;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
};

export function useAuthSession(
  service: AuthService,
  observability: ObservabilityService = defaultObservability
): AuthSession {
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const unsubscribe = service.observeAuth(user => {
      setCurrentUser(user);
      setAuthLoading(false);
      setAuthError("");
      if (user) {
        observability.identifyUser({ uid: user.uid });
      } else {
        observability.clearUser();
      }
    });

    return unsubscribe;
  }, [observability, service]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError("");
    try {
      await service.signIn(email, password);
      observability.trackEvent("login_success");
    } catch (error) {
      setAuthError("Nieprawidłowy e-mail lub hasło.");
      observability.trackEvent("login_failure");
      observability.captureError(error, { operation: "auth.login" });
      throw error;
    }
  }, [observability, service]);

  const logout = useCallback(async () => {
    await service.signOut();
    observability.trackEvent("logout");
    observability.clearUser();
  }, [observability, service]);

  return {
    authError,
    authLoading,
    currentUser,
    login,
    logout
  };
}

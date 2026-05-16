import { useCallback, useEffect, useState } from "react";
import type { AuthUser } from "../../domains/auth/authUser";
import type { AuthService } from "../../services/firebase";
import {
  observability as defaultObservability,
  type ObservabilityService,
  workflowTelemetry
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
        workflowTelemetry.identifyAuthUser(observability, user.uid);
      } else {
        workflowTelemetry.clearAuthUser(observability);
      }
    });

    return unsubscribe;
  }, [observability, service]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError("");
    try {
      await service.signIn(email, password);
      workflowTelemetry.trackLoginSuccess(observability);
    } catch (error) {
      setAuthError("Nieprawidłowy e-mail lub hasło.");
      workflowTelemetry.trackLoginFailure(observability, error);
      throw error;
    }
  }, [observability, service]);

  const logout = useCallback(async () => {
    await service.signOut();
    workflowTelemetry.trackLogout(observability);
  }, [observability, service]);

  return {
    authError,
    authLoading,
    currentUser,
    login,
    logout
  };
}

import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import type { AuthService } from "../../services/firebase";

export type AuthSession = {
  authError: string;
  authLoading: boolean;
  currentUser: User | null;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
};

export function useAuthSession(service: AuthService): AuthSession {
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = service.observeAuth(user => {
      setCurrentUser(user);
      setAuthLoading(false);
      setAuthError("");
    });

    return unsubscribe;
  }, [service]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError("");
    try {
      await service.signIn(email, password);
    } catch (error) {
      setAuthError("Nieprawidłowy email lub hasło.");
      throw error;
    }
  }, [service]);

  const logout = useCallback(async () => {
    await service.signOut();
  }, [service]);

  return {
    authError,
    authLoading,
    currentUser,
    login,
    logout
  };
}

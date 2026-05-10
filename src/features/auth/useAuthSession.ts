import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { authService } from "../../services/firebase";

export type AuthSession = {
  authError: string;
  authLoading: boolean;
  currentUser: User | null;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
};

export function useAuthSession(): AuthSession {
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = authService.observeAuth(user => {
      setCurrentUser(user);
      setAuthLoading(false);
      setAuthError("");
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError("");
    try {
      await authService.signIn(email, password);
    } catch (error) {
      setAuthError("Nieprawidłowy email lub hasło.");
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.signOut();
  }, []);

  return {
    authError,
    authLoading,
    currentUser,
    login,
    logout
  };
}

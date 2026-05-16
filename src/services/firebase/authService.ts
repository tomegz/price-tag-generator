import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User
} from 'firebase/auth';
import type { AuthUser } from '../../domains/auth/authUser';

export type AuthService = {
  observeAuth(callback: (user: AuthUser | null) => void): () => void;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
};

function toAuthUser(user: User): AuthUser {
  return {
    displayName: user.displayName ?? null,
    email: user.email ?? null,
    uid: user.uid
  };
}

export function createAuthService(auth: Auth): AuthService {
  return {
    observeAuth(callback) {
      return onAuthStateChanged(auth, user => callback(user ? toAuthUser(user) : null));
    },
    async signIn(email, password) {
      await signInWithEmailAndPassword(auth, email, password);
    },
    signOut() {
      return signOut(auth);
    }
  };
}

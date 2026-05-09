import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User
} from 'firebase/auth';

export type AuthService = {
  observeAuth(callback: (user: User | null) => void): () => void;
  signIn(email: string, password: string): Promise<unknown>;
  signOut(): Promise<void>;
};

export function createAuthService(auth: Auth): AuthService {
  return {
    observeAuth(callback) {
      return onAuthStateChanged(auth, callback);
    },
    signIn(email, password) {
      return signInWithEmailAndPassword(auth, email, password);
    },
    signOut() {
      return signOut(auth);
    }
  };
}

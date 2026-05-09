import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
  type UserCredential
} from 'firebase/auth';

export type AuthSignInResult = UserCredential;

export type AuthService = {
  observeAuth(callback: (user: User | null) => void): () => void;
  signIn(email: string, password: string): Promise<AuthSignInResult>;
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

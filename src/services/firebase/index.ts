import { firebaseServices } from './app';
import { createAuthService } from './authService';
import { createCatalogRepository } from './catalogRepository';

export { firebaseServices, createFirebaseServiceInstances } from './app';
export type { FirebaseServiceInstances } from './app';
export { createAuthService } from './authService';
export type { AuthService } from './authService';
export {
  catalogPaths,
  createCatalogRepository,
  isPermissionDenied,
  readCatalogBrands,
  toFirebaseRepositoryError
} from './catalogRepository';
export type {
  CatalogReadRepository,
  CatalogRepository,
  CatalogWriteRepository,
  FirebaseRepositoryError,
  SubscriptionHandlers
} from './catalogRepository';
export { readFirebaseRuntimeConfig } from './config';
export type { RepositoryError } from './repositoryError';

export const authService = createAuthService(firebaseServices.auth);
export const catalogRepository = createCatalogRepository(firebaseServices.database);

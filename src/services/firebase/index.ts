import { firebaseServices } from './app';
import { createAuthService } from './authService';
import { createCatalogRepository } from './catalogRepository';

export { firebaseServices, createFirebaseServiceInstances } from './app';
export { createAuthService } from './authService';
export {
  catalogPaths,
  createCatalogRepository,
  ensureWritableCatalogItem,
  isPermissionDenied,
  readCatalogBrands,
  toFirebaseRepositoryError
} from './catalogRepository';
export { readFirebaseRuntimeConfig } from './config';

export const authService = createAuthService(firebaseServices.auth);
export const catalogRepository = createCatalogRepository(firebaseServices.database);

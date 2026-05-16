import { createFirebaseServiceInstances } from "./app";
import { createAuthService } from "./authService";
import { createCatalogRepository } from "./catalogRepository";

export const firebaseServices = createFirebaseServiceInstances();
export const authService = createAuthService(firebaseServices.auth);
export const catalogRepository = createCatalogRepository(firebaseServices.database);

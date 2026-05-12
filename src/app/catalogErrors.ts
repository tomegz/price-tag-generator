export type RepositoryError = {
  code: string;
  message: string;
  cause: unknown;
};

export type CatalogErrorHandler = (error: RepositoryError) => void;

export function isPermissionDeniedCode(error: Pick<RepositoryError, "code">): boolean {
  return error.code === "PERMISSION_DENIED" || error.code === "permission-denied";
}

export function getCatalogErrorMessage(error: RepositoryError): string {
  return isPermissionDeniedCode(error)
    ? "Brak dostępu do katalogu. Zalogowany użytkownik nie ma uprawnień do tej bazy."
    : "Nie udało się zapisać lub pobrać danych katalogu.";
}

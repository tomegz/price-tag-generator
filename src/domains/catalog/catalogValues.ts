/**
 * Current catalog prices are whole-zloty display amounts from the legacy
 * Realtime Database shape. They are not cents.
 */
export type CatalogDisplayPrice = number;

/**
 * Production data still contains mixed string and number years. Preserve the
 * value until there is an explicit data migration.
 */
export type CatalogYear = string | number;

export function isCatalogDisplayPrice(value: unknown): value is CatalogDisplayPrice {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function isCatalogYear(value: unknown): value is CatalogYear {
  return typeof value === "string" || (typeof value === "number" && Number.isFinite(value));
}

export function assertCatalogDisplayPrice(
  value: unknown,
  fieldName: "price" | "discountPrice"
): CatalogDisplayPrice {
  if (!isCatalogDisplayPrice(value)) {
    throw new Error(`${fieldName} must be a non-negative finite display amount.`);
  }

  return value;
}

export function assertCatalogYear(value: unknown): CatalogYear {
  if (!isCatalogYear(value)) {
    throw new Error("year must be a string or number legacy catalog year.");
  }

  return value;
}

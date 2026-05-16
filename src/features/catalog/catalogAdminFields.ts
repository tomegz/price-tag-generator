import type { CatalogItem } from "../../domains/catalog/catalogItem";
import type { CatalogDraft } from "../../domains/catalog/catalogDraft";

export type CatalogAdminDraftTextField = Exclude<keyof CatalogDraft, "discountEnabled">;

export const catalogAdminDraftFields: CatalogAdminDraftTextField[] = [
  "brand",
  "model",
  "year",
  "price",
  "discountPrice"
];

export function getCatalogAdminFieldLabel(field: CatalogAdminDraftTextField): string {
  return {
    brand: "Marka",
    model: "Model",
    year: "Rocznik",
    price: "Cena katalogowa",
    discountPrice: "Cena promocyjna"
  }[field];
}

export function isCatalogAdminNumericField(field: CatalogAdminDraftTextField): boolean {
  return field === "price" || field === "discountPrice" || field === "year";
}

export function isCatalogAdminFieldDirty(
  product: CatalogItem,
  draft: CatalogDraft,
  field: keyof CatalogDraft
): boolean {
  if (field === "discountEnabled") return draft.discountEnabled !== product.discountEnabled;
  if (field === "discountPrice") return Number(draft.discountPrice || 0) !== Number(product.discountPrice);
  if (field === "price") return Number(draft.price) !== Number(product.price);
  if (field === "year") return String(draft.year) !== String(product.year);
  return draft[field] !== product[field];
}

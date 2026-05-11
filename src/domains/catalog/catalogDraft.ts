import type { CatalogItem, CatalogItemInput } from "./catalogItem";

export type CatalogDraft = {
  brand: string;
  model: string;
  year: string;
  price: string;
  discountPrice: string;
};

export function draftFromItem(item: CatalogItem): CatalogDraft {
  return {
    brand: item.brand,
    model: item.model,
    year: String(item.year || ""),
    price: String(item.price || ""),
    discountPrice: item.discountPrice ? String(item.discountPrice) : ""
  };
}

export function emptyCatalogDraft(defaultYear = new Date().getFullYear()): CatalogDraft {
  return {
    brand: "",
    model: "",
    year: String(defaultYear),
    price: "",
    discountPrice: ""
  };
}

export function isDraftValid(draft: CatalogDraft): boolean {
  const price = Number(draft.price);
  const discountPrice = draft.discountPrice === "" ? 0 : Number(draft.discountPrice);

  return (
    draft.brand.trim().length > 0 &&
    draft.model.trim().length > 0 &&
    draft.year.trim().length > 0 &&
    Number.isFinite(price) &&
    price >= 0 &&
    Number.isFinite(discountPrice) &&
    discountPrice >= 0
  );
}

export function catalogDraftToItem(draft: CatalogDraft): CatalogItemInput {
  const discountPrice = draft.discountPrice === "" ? 0 : Number(draft.discountPrice);

  return {
    brand: draft.brand.trim(),
    model: draft.model.trim(),
    year: draft.year.trim(),
    price: Number(draft.price),
    discountPrice,
    discountEnabled: discountPrice > 0
  };
}

export function isDraftDirty(original: CatalogItem, draft: CatalogDraft): boolean {
  const next = catalogDraftToItem(draft);

  return (
    next.brand !== original.brand ||
    next.model !== original.model ||
    String(next.year) !== String(original.year) ||
    Number(next.price) !== Number(original.price) ||
    Number(next.discountPrice) !== Number(original.discountPrice) ||
    next.discountEnabled !== original.discountEnabled
  );
}

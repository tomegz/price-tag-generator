import type { DiscountStatus, LegacyCatalogItem } from "./catalog";

export type CatalogDraft = {
  name: string;
  model: string;
  year: string;
  price: string;
  discountPrice: string;
};

export function draftFromItem(item: LegacyCatalogItem): CatalogDraft {
  return {
    name: item.name,
    model: item.model,
    year: String(item.year || ""),
    price: String(item.price || ""),
    discountPrice: item.discountPrice ? String(item.discountPrice) : ""
  };
}

export function emptyCatalogDraft(defaultYear = new Date().getFullYear()): CatalogDraft {
  return {
    name: "",
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
    draft.name.trim().length > 0 &&
    draft.model.trim().length > 0 &&
    draft.year.trim().length > 0 &&
    Number.isFinite(price) &&
    price >= 0 &&
    Number.isFinite(discountPrice) &&
    discountPrice >= 0
  );
}

export function catalogDraftToItem(draft: CatalogDraft): LegacyCatalogItem {
  const discountPrice = draft.discountPrice === "" ? 0 : Number(draft.discountPrice);
  const discountStatus: DiscountStatus = discountPrice > 0 ? "on" : "off";

  return {
    name: draft.name.trim(),
    model: draft.model.trim(),
    year: draft.year.trim(),
    price: Number(draft.price),
    discountPrice,
    discountStatus
  };
}

export function isDraftDirty(original: LegacyCatalogItem, draft: CatalogDraft): boolean {
  const next = catalogDraftToItem(draft);

  return (
    next.name !== original.name ||
    next.model !== original.model ||
    String(next.year) !== String(original.year) ||
    Number(next.price) !== Number(original.price) ||
    Number(next.discountPrice) !== Number(original.discountPrice) ||
    next.discountStatus !== original.discountStatus
  );
}

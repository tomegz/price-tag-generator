import { useCallback, useMemo, useState } from "react";
import {
  ALL_BRANDS,
  filterCatalogProducts
} from "../../domains/catalog/catalogFilter";
import type { CatalogProduct } from "../../domains/catalog/catalogProduct";
import type {
  BulkPromotionMode,
  BulkPromotionOptions
} from "./bulkPromotion";

type FilterOption = {
  label: string;
  value: string;
};

type UseBulkPromotionWizardOptions = {
  brands: string[];
  products: CatalogProduct[];
  onApply(productIds: string[], options: BulkPromotionOptions): Promise<void>;
  onClose(): void;
};

export type BulkPromotionWizardState = {
  allFilteredSelected: boolean;
  amount: number;
  brand: string;
  brandOptions: FilterOption[];
  error: string;
  filteredProducts: CatalogProduct[];
  mode: BulkPromotionMode;
  options: BulkPromotionOptions;
  percent: number;
  query: string;
  saving: boolean;
  selected: Record<string, boolean>;
  selectedCount: number;
  selectedItems: CatalogProduct[];
  step: number;
  apply(): Promise<void>;
  setAmount(amount: number): void;
  setBrand(brand: string): void;
  setMode(mode: BulkPromotionMode): void;
  setPercent(percent: number): void;
  setQuery(query: string): void;
  setStep(step: number): void;
  toggleAllFiltered(): void;
  toggleProduct(productId: string): void;
};

export function useBulkPromotionWizard({
  brands,
  onApply,
  onClose,
  products
}: UseBulkPromotionWizardOptions): BulkPromotionWizardState {
  const [amount, setAmount] = useState(200);
  const [brand, setBrand] = useState(ALL_BRANDS);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<BulkPromotionMode>("percent");
  const [percent, setPercent] = useState(30);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState(1);

  const brandOptions = useMemo(
    () => [
      { label: "Wszystkie", value: ALL_BRANDS },
      ...brands.map(item => ({ label: item, value: item }))
    ],
    [brands]
  );

  const filteredProducts = useMemo(
    () => filterCatalogProducts(products, { brand, query }),
    [brand, products, query]
  );

  const selectedItems = useMemo(
    () => products.filter(product => selected[product.id]),
    [products, selected]
  );

  const selectedCount = selectedItems.length;
  const allFilteredSelected =
    filteredProducts.length > 0 && filteredProducts.every(product => selected[product.id]);
  const options = useMemo(
    () => ({ amount, mode, percent }),
    [amount, mode, percent]
  );

  const toggleAllFiltered = useCallback(() => {
    setSelected(current => {
      const next = { ...current };
      if (allFilteredSelected) {
        filteredProducts.forEach(product => {
          delete next[product.id];
        });
      } else {
        filteredProducts.forEach(product => {
          next[product.id] = true;
        });
      }
      return next;
    });
  }, [allFilteredSelected, filteredProducts]);

  const toggleProduct = useCallback((productId: string) => {
    setSelected(current => ({ ...current, [productId]: !current[productId] }));
  }, []);

  const apply = useCallback(async () => {
    setError("");
    setSaving(true);

    try {
      await onApply(selectedItems.map(product => product.id), options);
      onClose();
    } catch {
      setError("Nie udało się zapisać promocji. Spróbuj ponownie.");
    } finally {
      setSaving(false);
    }
  }, [onApply, onClose, options, selectedItems]);

  return {
    allFilteredSelected,
    amount,
    apply,
    brand,
    brandOptions,
    error,
    filteredProducts,
    mode,
    options,
    percent,
    query,
    saving,
    selected,
    selectedCount,
    selectedItems,
    setAmount,
    setBrand,
    setMode,
    setPercent,
    setQuery,
    setStep,
    step,
    toggleAllFiltered,
    toggleProduct
  };
}

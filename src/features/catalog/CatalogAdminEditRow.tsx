import Button from "@/design-system/Button";
import TextField from "@/design-system/TextField";
import {
  isDraftDirty,
  isDraftValid,
  type CatalogDraft
} from "@/domains/catalog/catalogDraft";
import type { CatalogProduct } from "@/domains/catalog/catalogProduct";
import {
  catalogAdminDraftFields,
  getCatalogAdminFieldLabel,
  isCatalogAdminFieldDirty,
  isCatalogAdminNumericField
} from "./catalogAdminFields";
import CatalogAdminPromoDraftCell from "./CatalogAdminPromoDraftCell";

type CatalogAdminEditRowProps = {
  bulkMode: boolean;
  draft: CatalogDraft;
  product: CatalogProduct;
  onCancel(): void;
  onSave(): Promise<void>;
  onUpdateDraft<K extends keyof CatalogDraft>(field: K, value: CatalogDraft[K]): void;
};

const CatalogAdminEditRow = ({
  bulkMode,
  draft,
  onCancel,
  onSave,
  onUpdateDraft,
  product
}: CatalogAdminEditRowProps) => {
  const dirty = isDraftValid(draft) && isDraftDirty(product, draft);

  return (
    <div
      className={`admin-row admin-row--editing${bulkMode ? " admin-row--bulk-editing" : ""}`}
      data-product-id={product.id}
      data-testid="admin-product-row"
    >
      {bulkMode ? <span /> : null}
      {catalogAdminDraftFields.map(field => (
        field === "discountPrice" ? (
          <CatalogAdminPromoDraftCell
            dirty={
              isCatalogAdminFieldDirty(product, draft, "discountPrice") ||
              isCatalogAdminFieldDirty(product, draft, "discountEnabled")
            }
            draft={draft}
            key={field}
            onDiscountEnabledChange={value => onUpdateDraft("discountEnabled", value)}
            onDiscountPriceChange={value => onUpdateDraft("discountPrice", value)}
          />
        ) : (
          <TextField
            aria-label={getCatalogAdminFieldLabel(field)}
            className={isCatalogAdminFieldDirty(product, draft, field) ? "admin-input--dirty" : ""}
            key={field}
            numeric={isCatalogAdminNumericField(field)}
            onChange={event => onUpdateDraft(field, event.target.value)}
            placeholder={getCatalogAdminFieldLabel(field)}
            value={draft[field]}
          />
        )
      ))}
      <div className="admin-row__actions">
        <Button onClick={onCancel} variant="ghost">Anuluj</Button>
        <Button disabled={!dirty} icon="check" onClick={onSave} variant={dirty ? "accent" : "primary"}>
          Zapisz
        </Button>
      </div>
    </div>
  );
};

export default CatalogAdminEditRow;

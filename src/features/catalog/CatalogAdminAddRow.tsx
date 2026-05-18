import Button from "@/design-system/Button";
import TextField from "@/design-system/TextField";
import {
  isDraftValid,
  type CatalogDraft
} from "@/domains/catalog/catalogDraft";
import {
  catalogAdminDraftFields,
  getCatalogAdminFieldLabel,
  isCatalogAdminNumericField
} from "./catalogAdminFields";
import CatalogAdminPromoDraftCell from "./CatalogAdminPromoDraftCell";

type CatalogAdminAddRowProps = {
  bulkMode: boolean;
  draft: CatalogDraft;
  onCancel(): void;
  onSave(): Promise<void>;
  onUpdateDraft<K extends keyof CatalogDraft>(field: K, value: CatalogDraft[K]): void;
};

const CatalogAdminAddRow = ({
  bulkMode,
  draft,
  onCancel,
  onSave,
  onUpdateDraft
}: CatalogAdminAddRowProps) => (
  <div
    className={`admin-row admin-row--editing${bulkMode ? " admin-row--bulk-editing" : ""}`}
    data-testid="admin-add-row"
  >
    {bulkMode ? <span /> : null}
    {catalogAdminDraftFields.map(field => (
      field === "discountPrice" ? (
        <CatalogAdminPromoDraftCell
          draft={draft}
          key={field}
          onDiscountEnabledChange={value => onUpdateDraft("discountEnabled", value)}
          onDiscountPriceChange={value => onUpdateDraft("discountPrice", value)}
        />
      ) : (
        <TextField
          aria-label={getCatalogAdminFieldLabel(field)}
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
      <Button disabled={!isDraftValid(draft)} icon="check" onClick={onSave} variant="accent">Zapisz</Button>
    </div>
  </div>
);

export default CatalogAdminAddRow;

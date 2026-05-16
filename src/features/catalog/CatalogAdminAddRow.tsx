import Button from "../../design-system/Button";
import TextField from "../../design-system/TextField";
import {
  isDraftValid,
  type CatalogDraft
} from "../../domains/catalog/catalogDraft";
import {
  catalogAdminDraftFields,
  getCatalogAdminFieldLabel,
  isCatalogAdminNumericField,
  type CatalogAdminDraftField
} from "./catalogAdminFields";

type CatalogAdminAddRowProps = {
  bulkMode: boolean;
  draft: CatalogDraft;
  onCancel(): void;
  onSave(): Promise<void>;
  onUpdateDraft(field: CatalogAdminDraftField, value: string): void;
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
      <TextField
        aria-label={getCatalogAdminFieldLabel(field)}
        key={field}
        numeric={isCatalogAdminNumericField(field)}
        onChange={event => onUpdateDraft(field, event.target.value)}
        placeholder={getCatalogAdminFieldLabel(field)}
        value={draft[field]}
      />
    ))}
    <div className="admin-row__actions">
      <Button onClick={onCancel} variant="ghost">Anuluj</Button>
      <Button disabled={!isDraftValid(draft)} icon="check" onClick={onSave} variant="accent">Zapisz</Button>
    </div>
  </div>
);

export default CatalogAdminAddRow;

import TextField from "../../design-system/TextField";
import type { CatalogDraft } from "../../domains/catalog/catalogDraft";
import { getCatalogAdminFieldLabel } from "./catalogAdminFields";

type CatalogAdminPromoDraftCellProps = {
  draft: CatalogDraft;
  dirty?: boolean;
  onDiscountEnabledChange(value: boolean): void;
  onDiscountPriceChange(value: string): void;
};

const CatalogAdminPromoDraftCell = ({
  dirty = false,
  draft,
  onDiscountEnabledChange,
  onDiscountPriceChange
}: CatalogAdminPromoDraftCellProps) => (
  <div className="admin-promo-cell">
    <label
      className="admin-promo-toggle"
      data-active={draft.discountEnabled ? "true" : "false"}
      title="Promocja aktywna"
    >
      <input
        aria-label="Promocja aktywna"
        checked={draft.discountEnabled}
        onChange={event => onDiscountEnabledChange(event.currentTarget.checked)}
        type="checkbox"
      />
      <span className="admin-promo-switch" aria-hidden="true" />
    </label>
    <TextField
      aria-label={getCatalogAdminFieldLabel("discountPrice")}
      className={dirty ? "admin-input--dirty" : ""}
      disabled={!draft.discountEnabled}
      numeric
      onChange={event => onDiscountPriceChange(event.target.value)}
      placeholder={getCatalogAdminFieldLabel("discountPrice")}
      value={draft.discountPrice}
    />
  </div>
);

export default CatalogAdminPromoDraftCell;

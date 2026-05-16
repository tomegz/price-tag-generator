import Icon from "../../design-system/Icon";
import {
  hiddenRowsLabel,
  selectedRowsLabel
} from "./catalogAdminCopy";

type CatalogSelectionPillProps = {
  hiddenSelectedCount: number;
  selectedCount: number;
  onClear(): void;
  onDelete(): void;
  onPromotion(): void;
};

const CatalogSelectionPill = ({
  hiddenSelectedCount,
  onClear,
  onDelete,
  onPromotion,
  selectedCount
}: CatalogSelectionPillProps) => {
  const empty = selectedCount === 0;

  return (
    <div className="selection-pill">
      <span className="selection-pill__count pb-mono" data-empty={empty ? "true" : "false"}>
        {selectedCount}
      </span>
      <span className="selection-pill__label">
        {empty ? "Zaznacz produkty, aby kontynuować" : selectedRowsLabel(selectedCount)}
        {!empty && hiddenSelectedCount > 0 ? (
          <span className="selection-pill__hint pb-mono">
            {hiddenSelectedCount} {hiddenRowsLabel(hiddenSelectedCount)} przez filtr
          </span>
        ) : null}
      </span>
      {!empty ? (
        <button className="selection-pill__clear" onClick={onClear} type="button">
          <Icon name="x" size={11} /> Wyczyść
        </button>
      ) : null}
      <span className="selection-pill__separator" />
      <button
        className="selection-pill__action selection-pill__action--promo"
        disabled={empty}
        onClick={empty ? undefined : onPromotion}
        type="button"
      >
        <Icon name="percent" size={12} /> Promocja
      </button>
      <button
        className="selection-pill__action selection-pill__action--delete"
        disabled={empty}
        onClick={empty ? undefined : onDelete}
        type="button"
      >
        <Icon name="trash" size={12} /> Usuń
      </button>
    </div>
  );
};

export default CatalogSelectionPill;

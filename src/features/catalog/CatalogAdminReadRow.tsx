import Button from "../../design-system/Button";
import type { CatalogProduct } from "../../domains/catalog/catalogProduct";
import {
  formatPLN,
  hasActivePromotion
} from "../../domains/pricing/priceFormatting";

type CatalogAdminReadRowProps = {
  bulkMode: boolean;
  product: CatalogProduct;
  selected: boolean;
  onDelete(): void;
  onEdit(): void;
  onToggleSelection(): void;
};

const CatalogAdminReadRow = ({
  bulkMode,
  onDelete,
  onEdit,
  onToggleSelection,
  product,
  selected
}: CatalogAdminReadRowProps) => {
  const onPromo = hasActivePromotion(product);

  return (
    <div
      className="admin-row"
      data-product-id={product.id}
      data-selected={bulkMode && selected ? "true" : "false"}
      data-testid="admin-product-row"
      onClick={() => {
        if (bulkMode) onToggleSelection();
      }}
    >
      {bulkMode ? (
        <label className="admin-row__select" onClick={event => event.stopPropagation()}>
          <input
            aria-label={`Zaznacz ${product.brand} ${product.model}`}
            checked={selected}
            onChange={onToggleSelection}
            type="checkbox"
          />
        </label>
      ) : null}
      <strong>{product.brand}</strong>
      <span>{product.model}</span>
      <span className="pb-mono muted">{product.yearLabel}</span>
      <strong className="pb-mono">{formatPLN(product.price)}</strong>
      <span className={`pb-mono ${onPromo ? "accent" : "muted"}`}>
        {onPromo ? formatPLN(product.discountPrice) : "—"}
      </span>
      {!bulkMode ? (
        <div className="admin-row__actions">
          <Button icon="pencil" onClick={onEdit} variant="ghost">Edytuj</Button>
          <Button
            aria-label={`Usuń ${product.brand} ${product.model}`}
            icon="trash"
            onClick={onDelete}
            variant="ghost"
          >
            Usuń
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default CatalogAdminReadRow;

import Button from "../../design-system/Button";
import Icon from "../../design-system/Icon";
import QuantityStepper from "../../design-system/QuantityStepper";
import {
  getPrintableTagCountWord,
  getPrintSheetCountWord,
  getTagCountWord
} from "../../domains/language/printCopy";
import {
  getPrintQueueTotal,
  type PrintQueue
} from "../../domains/printQueue/printQueue";
import { getPrintSheetCount } from "../../domains/printTagRendering/printTagRendering";
import {
  formatPLN,
  getEffectivePrice
} from "../../domains/pricing/priceFormatting";
import type { CatalogProduct } from "../../domains/catalog/catalogProduct";
import "./PrintQueuePanel.css";

type PrintQueuePanelProps = {
  printQueue: PrintQueue;
  products: CatalogProduct[];
  onClear(): void;
  onPrint(): void;
  onRemove(productId: string): void;
  onSetQuantity(productId: string, quantity: number): void;
};

const PrintQueuePanel = ({
  onClear,
  onPrint,
  onRemove,
  onSetQuantity,
  printQueue,
  products
}: PrintQueuePanelProps) => {
  const productsById = new Map(products.map(product => [product.id, product]));
  const queueIds = Object.keys(printQueue);
  const totalTags = getPrintQueueTotal(printQueue);
  const totalPages = getPrintSheetCount(totalTags);
  const empty = queueIds.length === 0;

  return (
    <aside aria-labelledby="print-queue-title" className="print-queue-panel" data-testid="print-queue">
      <header className="print-queue-panel__header">
        <div className="print-queue-panel__meta">
          <span className="pb-mono">Kolejka druku</span>
          <span className="pb-mono">
            {totalPages} {getPrintSheetCountWord(totalPages)}
          </span>
        </div>
        <div className="print-queue-panel__total">
          <strong className="pb-mono" data-testid="print-queue-total" id="print-queue-title">
            {String(totalTags).padStart(2, "0")}
          </strong>
          <span>{getPrintableTagCountWord(totalTags)} do druku</span>
        </div>
      </header>

      <div className="print-queue-panel__body">
        {empty ? (
          <div className="print-queue-panel__empty">
            <span className="print-queue-panel__empty-icon">
              <Icon name="tag" size={22} />
            </span>
            <strong>Kolejka jest pusta</strong>
            <p>Wybierz produkty z listy</p>
          </div>
        ) : (
          queueIds.map(productId => {
            const product = productsById.get(productId);
            const quantity = printQueue[productId];

            return (
              <div
                className="print-queue-item"
                data-product-id={productId}
                data-testid="print-queue-item"
                key={productId}
              >
                <div className="print-queue-item__copy">
                  <strong>{product ? `${product.brand} ${product.model}` : "Cena tego produktu nie jest już dostępna"}</strong>
                  <span className="pb-mono">
                    {product ? `${product.yearLabel} · ${formatPLN(getEffectivePrice(product))}` : "Usuń z kolejki"}
                  </span>
                </div>
                <QuantityStepper
                  ariaLabel={`Ilość w kolejce dla ${product?.brand || "produktu"}`}
                  onChange={value => onSetQuantity(productId, value)}
                  size="sm"
                  value={quantity}
                />
                <Button aria-label="Usuń z kolejki" icon="x" onClick={() => onRemove(productId)} variant="icon" />
              </div>
            );
          })
        )}
      </div>

      <footer className="print-queue-panel__footer">
        <Button disabled={empty} icon="trash" onClick={onClear} variant="ghost">
          Wyczyść
        </Button>
        <Button className="print-queue-panel__print" disabled={empty} icon="print" onClick={onPrint} variant="accent">
          <span>Drukuj <span className="pb-mono">{totalTags}</span> {getTagCountWord(totalTags)}</span>
        </Button>
      </footer>
    </aside>
  );
};

export default PrintQueuePanel;

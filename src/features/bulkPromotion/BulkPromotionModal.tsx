import { useMemo, useState } from "react";
import Button from "../../design-system/Button";
import Icon from "../../design-system/Icon";
import Modal from "../../design-system/Modal";
import SegmentedControl from "../../design-system/SegmentedControl";
import type { CatalogProduct } from "../../domains/catalog/catalogProduct";
import {
  productCountLabel,
  productGenitiveCountLabel
} from "../../domains/language/catalogCopy";
import { formatPLN } from "../../domains/pricing/priceFormatting";
import {
  calculateBulkDiscountPrice,
  type BulkPromotionMode,
  type BulkPromotionOptions
} from "../../domains/pricing/bulkPromotion";

type BulkPromotionModalProps = {
  products: CatalogProduct[];
  onApply(productIds: string[], options: BulkPromotionOptions): Promise<void>;
  onClose(): void;
};

const percentQuickPicks = [10, 15, 20, 25, 30];
const amountQuickPicks = [50, 100, 200, 500, 1000];

const BulkPromotionModal = ({
  onApply,
  onClose,
  products
}: BulkPromotionModalProps) => {
  const [amount, setAmount] = useState(200);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<BulkPromotionMode>("percent");
  const [percent, setPercent] = useState(30);
  const [saving, setSaving] = useState(false);
  const selectedCount = products.length;
  const options = useMemo(
    () => ({ amount, mode, percent }),
    [amount, mode, percent]
  );

  const apply = async () => {
    if (selectedCount === 0) return;
    setError("");
    setSaving(true);

    try {
      await onApply(products.map(product => product.id), options);
      onClose();
    } catch {
      setError("Nie udało się zapisać promocji. Spróbuj ponownie.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal labelledBy="bulk-promotion-title" onClose={onClose}>
      <header className="bulk-modal__header">
        <div className="bulk-modal__title">
          <span className="bulk-modal__icon"><Icon name="percent" size={15} /></span>
          <div>
            <h2 id="bulk-promotion-title">Promocja zbiorcza</h2>
            <p>Ustaw rabat i zatwierdź</p>
          </div>
        </div>
      </header>

      <div className="bulk-modal__body bulk-modal__body--configure">
        <section className="bulk-config">
          <p className="bulk-config__kicker pb-mono">KONFIGURACJA I PODGLĄD</p>
          <h3>
            Ustaw rabat dla <span className="pb-mono">{selectedCount}</span> {productGenitiveCountLabel(selectedCount)}
          </h3>

          <SegmentedControl<BulkPromotionMode>
            ariaLabel="Tryb rabatu"
            className="bulk-config__mode-picker"
            onChange={setMode}
            options={[
              { label: "Procentowo (%)", value: "percent" },
              { label: "Kwotowo (zł)", value: "amount" }
            ]}
            value={mode}
          />

          {mode === "percent" ? (
            <>
              <div className="bulk-config__display pb-mono">
                {percent}<span>%</span>
              </div>
              <input
                className="bulk-config__slider"
                max={70}
                min={5}
                onChange={event => setPercent(Number(event.target.value))}
                step={5}
                type="range"
                value={percent}
              />
              <div className="bulk-config__chips">
                {percentQuickPicks.map(value => (
                  <button
                    data-active={percent === value ? "true" : "false"}
                    key={value}
                    onClick={() => setPercent(value)}
                    type="button"
                  >
                    {value}%
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="bulk-config__display pb-mono">
                -{amount.toLocaleString("pl-PL")}<span> zł</span>
              </div>
              <input
                className="bulk-config__slider"
                max={2000}
                min={50}
                onChange={event => setAmount(Number(event.target.value))}
                step={50}
                type="range"
                value={amount}
              />
              <div className="bulk-config__chips">
                {amountQuickPicks.map(value => (
                  <button
                    data-active={amount === value ? "true" : "false"}
                    key={value}
                    onClick={() => setAmount(value)}
                    type="button"
                  >
                    {value} zł
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="bulk-config__note">
            <Icon name="info" size={14} />
            <span>
              Rabat zostanie obliczony od ceny katalogowej. Jeśli produkt ma już aktywną promocję, zostanie nadpisana.
            </span>
          </div>
        </section>

        <section className="bulk-preview" aria-label="Podgląd promocji">
          <p className="pb-mono">PODGLĄD · {selectedCount} {productCountLabel(selectedCount).toUpperCase()}</p>
          <div className="bulk-preview__list">
            {products.map(product => {
              const newPrice = calculateBulkDiscountPrice(product.price, options);

              return (
                <div className="bulk-preview__item" key={product.id}>
                  <strong>{product.brand} {product.model}</strong>
                  <span className="pb-mono muted old-price">{formatPLN(product.price)}</span>
                  <Icon name="arrow-r" size={11} />
                  <span className="pb-mono accent">{formatPLN(newPrice)}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <footer className="bulk-modal__footer">
        <Button onClick={onClose} variant="ghost">Anuluj</Button>
        {error ? <span className="bulk-modal__error" role="alert">{error}</span> : null}
        <div className="bulk-modal__footer-spacer" />
        <Button disabled={saving || selectedCount === 0} onClick={() => void apply()} variant="accent">
          {saving ? "Zapisywanie..." : (
            <span>
              Zastosuj promocję do <span className="pb-mono">{selectedCount}</span> {productGenitiveCountLabel(selectedCount)}
            </span>
          )}
        </Button>
      </footer>
    </Modal>
  );
};

export default BulkPromotionModal;

import Button from "../../design-system/Button";
import FilterPills from "../../design-system/FilterPills";
import FlowStepper from "../../design-system/FlowStepper";
import Icon from "../../design-system/Icon";
import Modal from "../../design-system/Modal";
import SearchInput from "../../design-system/SearchInput";
import SegmentedControl from "../../design-system/SegmentedControl";
import type { CatalogProduct } from "../../domains/catalog/catalogProduct";
import { formatPLN } from "../../domains/pricing/priceFormatting";
import {
  calculateBulkDiscountPrice,
  type BulkPromotionMode,
  type BulkPromotionOptions
} from "./bulkPromotion";
import { useBulkPromotionWizard } from "./useBulkPromotionWizard";

type BulkPromotionModalProps = {
  brands: string[];
  products: CatalogProduct[];
  onApply(productIds: string[], options: BulkPromotionOptions): Promise<void>;
  onClose(): void;
};

const percentQuickPicks = [10, 15, 20, 25, 30, 40, 50];
const amountQuickPicks = [50, 100, 200, 500, 1000];

const BulkPromotionModal = ({ brands, onApply, onClose, products }: BulkPromotionModalProps) => {
  const {
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
  } = useBulkPromotionWizard({
    brands,
    onApply,
    onClose,
    products
  });

  return (
    <Modal labelledBy="bulk-promotion-title" onClose={onClose}>
      <header className="bulk-modal__header">
        <div className="bulk-modal__title">
          <span className="bulk-modal__icon"><Icon name="percent" size={15} /></span>
          <div>
            <h2 id="bulk-promotion-title">Promocja zbiorcza</h2>
            <p>Wybierz produkty, ustaw rabat, zatwierdź</p>
          </div>
        </div>
        <div className="bulk-modal__stepper">
          <FlowStepper currentStep={step} totalSteps={2} />
        </div>
      </header>

      {step === 1 ? (
        <div className="bulk-modal__body bulk-modal__body--select">
          <div className="bulk-toolbar">
            <SearchInput
              aria-label="Szukaj produktów do promocji"
              onChange={event => setQuery(event.target.value)}
              placeholder="Szukaj marki lub modelu"
              value={query}
            />
            <FilterPills ariaLabel="Filtr marki" onChange={setBrand} options={brandOptions} value={brand} />
            <span className="bulk-toolbar__count pb-mono">
              Wybrano: <strong>{selectedCount}</strong> / {products.length}
            </span>
          </div>

          <div className="bulk-table">
            <label className="bulk-table__header">
              <input checked={allFilteredSelected} onChange={toggleAllFiltered} type="checkbox" />
              <span>MARKA</span>
              <span>MODEL</span>
              <span>ROK</span>
              <span>CENA</span>
              <span>PROMO</span>
            </label>
            {filteredProducts.map(product => {
              const checked = Boolean(selected[product.id]);

              return (
                <label
                  className="bulk-table__row"
                  data-product-id={product.id}
                  data-selected={checked ? "true" : "false"}
                  data-testid="bulk-product-row"
                  key={product.id}
                >
                  <input
                    checked={checked}
                    onChange={() => toggleProduct(product.id)}
                    type="checkbox"
                  />
                  <strong>{product.brand}</strong>
                  <span>{product.model}</span>
                  <span className="pb-mono muted">{product.yearLabel}</span>
                  <span className="pb-mono">{formatPLN(product.price)}</span>
                  <span className={`pb-mono ${product.discountStatus === "on" ? "accent" : "muted"}`}>
                    {product.discountStatus === "on" ? formatPLN(product.discountPrice) : "—"}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bulk-modal__body bulk-modal__body--configure">
          <section className="bulk-config">
            <p className="bulk-config__kicker pb-mono">KROK 2 Z 2 · KONFIGURACJA I PODGLĄD</p>
            <h3>
              Ustaw rabat dla <span className="pb-mono">{selectedCount}</span> {selectedCount === 1 ? "produktu" : "produktów"}
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
            <p className="pb-mono">PODGLĄD · {selectedCount} {selectedCount === 1 ? "PRODUKT" : "PRODUKTÓW"}</p>
            <div className="bulk-preview__list">
              {selectedItems.map(product => {
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
      )}

      <footer className="bulk-modal__footer">
        <Button onClick={onClose} variant="ghost">Anuluj</Button>
        {error ? <span className="bulk-modal__error" role="alert">{error}</span> : null}
        <div className="bulk-modal__footer-spacer" />
        {step === 2 ? <Button icon="arrow-l" onClick={() => setStep(1)} variant="ghost">Wstecz</Button> : null}
        {step === 1 ? (
          <Button disabled={selectedCount === 0} icon="arrow-r" onClick={() => setStep(2)}>
            <span>Dalej (<span className="pb-mono">{selectedCount}</span>)</span>
          </Button>
        ) : (
          <Button disabled={saving || selectedCount === 0} onClick={() => void apply()} variant="accent">
            {saving ? "Zapisywanie..." : (
              <span>
                Zastosuj promocję do <span className="pb-mono">{selectedCount}</span> produktów
              </span>
            )}
          </Button>
        )}
      </footer>
    </Modal>
  );
};

export default BulkPromotionModal;

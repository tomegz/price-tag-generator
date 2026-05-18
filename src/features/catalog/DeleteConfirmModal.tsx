import { useState } from "react";
import Button from "../../design-system/Button";
import Icon from "../../design-system/Icon";
import type { CatalogProduct } from "../../domains/catalog/catalogProduct";
import {
  additionalItemsLabel,
  productCountLabel
} from "../../domains/language/catalogCopy";
import { formatPLN } from "../../domains/pricing/priceFormatting";
import "./DeleteConfirmModal.css";

type DeleteConfirmMode = "quick" | "phrase";

type DeleteConfirmModalProps = {
  mode: DeleteConfirmMode;
  products: CatalogProduct[];
  onCancel(): void;
  onConfirm(): void;
};

const requiredPhrase = "USUŃ";
const previewLimit = 4;

const DeleteConfirmModal = ({
  mode,
  onCancel,
  onConfirm,
  products
}: DeleteConfirmModalProps) => {
  const [phrase, setPhrase] = useState("");
  const requiresPhrase = mode === "phrase";
  const count = products.length;
  const previewProducts = products.slice(0, previewLimit);
  const remainingCount = Math.max(0, count - previewProducts.length);
  const phraseMatches = phrase.trim().toUpperCase() === requiredPhrase;
  const canConfirm = !requiresPhrase || phraseMatches;

  return (
    <div className="delete-confirm-overlay" role="presentation">
      <section
        aria-labelledby="delete-confirm-title"
        aria-modal="true"
        className="delete-confirm"
        role="dialog"
      >
        <header className="delete-confirm__header">
          <span className="delete-confirm__icon">
            <Icon name="trash" size={16} />
          </span>
          <div>
            <h2 id="delete-confirm-title">
              Usuń <span className="pb-mono">{count}</span> {productCountLabel(count)}?
            </h2>
            <p>Operacji nie można cofnąć.</p>
          </div>
        </header>

        <div className="delete-confirm__body">
          <p className="delete-confirm__kicker pb-mono">ZOSTANĄ USUNIĘTE</p>
          <div className="delete-confirm__preview">
            {previewProducts.map(product => (
              <div className="delete-confirm__item" key={product.id}>
                <strong>
                  {product.brand} <span>{product.model}</span>
                </strong>
                <span className="pb-mono muted">{product.yearLabel}</span>
                <span className="pb-mono">{formatPLN(product.price)}</span>
              </div>
            ))}
            {remainingCount > 0 ? (
              <p className="delete-confirm__remaining pb-mono">
                + {remainingCount} {additionalItemsLabel(remainingCount)}...
              </p>
            ) : null}
          </div>

          {requiresPhrase ? (
            <div className="delete-confirm__phrase">
              <p>
                Aby potwierdzić, wpisz słowo{" "}
                <span className="delete-confirm__required pb-mono">{requiredPhrase}</span>
                {" "}w pole poniżej.
              </p>
              <input
                autoFocus
                aria-label="Potwierdzenie usunięcia"
                className="pb-mono"
                onChange={event => setPhrase(event.target.value)}
                placeholder={requiredPhrase}
                value={phrase}
              />
            </div>
          ) : null}
        </div>

        <footer className="delete-confirm__footer">
          <Button onClick={onCancel} variant="ghost">Anuluj</Button>
          <Button
            disabled={!canConfirm}
            icon="trash"
            onClick={canConfirm ? onConfirm : undefined}
            variant="accent"
          >
            Usuń {count}
          </Button>
        </footer>
      </section>
    </div>
  );
};

export default DeleteConfirmModal;

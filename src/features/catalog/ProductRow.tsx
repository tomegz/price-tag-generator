import { useState } from "react";
import Button from "@/design-system/Button";
import PromoPrice from "@/design-system/PromoPrice";
import QuantityStepper from "@/design-system/QuantityStepper";
import {
  formatPLN,
  hasActivePromotion
} from "@/domains/pricing/priceFormatting";
import type { CatalogProduct } from "@/domains/catalog/catalogProduct";

type ProductRowProps = {
  product: CatalogProduct;
  inQueue: number;
  onAdd(productId: string, quantity: number): void;
};

const ProductRow = ({ inQueue, onAdd, product }: ProductRowProps) => {
  const [quantity, setQuantity] = useState(1);
  const onPromo = hasActivePromotion(product);

  return (
    <div
      className="product-row"
      data-in-queue={inQueue > 0 ? "true" : "false"}
      data-product-id={product.id}
      data-testid="product-row"
    >
      <span className="product-row__identity">
        <strong>{product.brand}</strong>
        <span>{product.model}</span>
        {inQueue > 0 ? <em className="pb-mono">W KOLEJCE: {inQueue}</em> : null}
      </span>
      <span className="product-row__year pb-mono">{product.yearLabel}</span>
      <span className="product-row__price">
        {onPromo ? (
          <PromoPrice inline newPrice={formatPLN(product.discountPrice)} oldPrice={formatPLN(product.price)} />
        ) : (
          <strong className="pb-mono">{formatPLN(product.price)}</strong>
        )}
      </span>
      <span className="product-row__status">
        {onPromo ? <span className="product-row__promo-chip pb-mono">PROMOCJA</span> : <span className="pb-mono">CENA KATALOGOWA</span>}
      </span>
      <span className="product-row__actions">
        <QuantityStepper
          ariaLabel={`Ilość etykiet dla ${product.brand} ${product.model}`}
          onChange={setQuantity}
          value={quantity}
        />
        <Button icon="plus" onClick={() => onAdd(product.id, quantity)}>
          Dodaj
        </Button>
      </span>
    </div>
  );
};

export default ProductRow;

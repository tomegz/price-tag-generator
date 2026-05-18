import type { CatalogItem } from "../../domains/catalog/catalogItem";
import { hasActivePromotion } from "../../domains/pricing/priceFormatting";
import "./PrintTag.css";
import renderPrintTagParagraphs from "./renderPrintTagParagraphs";

type PrintTagProps = {
  item: CatalogItem;
};

const PrintTag = ({ item }: PrintTagProps) => {
  const name = item.brand.toUpperCase();
  const model = renderPrintTagParagraphs(item.model.toUpperCase());
  const onDiscount = hasActivePromotion(item);
  const discountPrice = onDiscount ? <p className="after-discount">{item.discountPrice},-</p> : "";
  const smallHeader = name.length > 7 ? "smaller" : "";
  return (
      <div data-testid="print-tag">
        <div className="half-tag">
          <div className="text-content">
            <h3 className={smallHeader}>{name}</h3>
            {model}
            <p className={onDiscount ? "before-discount" : "after-discount"}>{item.price},-</p>
            {discountPrice}
          </div>
        </div>
        <div className="half-tag">
          <div className="text-content">
            <h3 className={smallHeader}>{name}</h3>
            {model}
            <p className={onDiscount ? "before-discount" : "after-discount"}>{item.price},-</p>
            {discountPrice}
          </div>
        </div>
      </div>
  );
};

export default PrintTag;

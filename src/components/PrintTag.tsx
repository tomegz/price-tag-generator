import "../styles/PrintTag.css";
import formatParagraphs from "../helpers/formatParagraphs";
import type { LegacyCatalogItem } from "../domains/catalog/catalog";

type PrintTagProps = {
  item: LegacyCatalogItem;
};

const PrintTag = ({ item }: PrintTagProps) => {
  const name = item.name.toUpperCase();
  const model = formatParagraphs(item.model.toUpperCase());
  const onDiscount = item.discountStatus === "on";
  const discountPrice = onDiscount ? <p className="after-discount">{item.discountPrice},-</p> : "";
  const smallHeader = name.length > 7 ? "smaller" : "";
  return (
      <div>
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

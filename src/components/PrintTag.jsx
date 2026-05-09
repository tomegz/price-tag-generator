import React from "react";
import PropTypes from "prop-types";
import "../styles/PrintTag.css";
import formatParagraphs from "../helpers/formatParagraphs";

const PrintTag = ({item}) => {
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

PrintTag.propTypes = {
  item: PropTypes.object.isRequired
}

/* Fixes issue that PrintTags are rendered after print queue is initialized, but catalog
   items are not yet initialized, causing React trying to render PrintTag with item of
   undefined */

PrintTag.defaultProps = {
  item: {
    name: "default",
    model: "default",
    price: 999,
    discountPrice: 999,
    discountStatus: "off"
  }
}

export default PrintTag;

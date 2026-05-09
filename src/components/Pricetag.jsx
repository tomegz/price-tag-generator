import React from "react";
import PropTypes from "prop-types";
import "../styles/Pricetag.css";
import formatParagraphs from "../helpers/formatParagraphs";

const Pricetag = ({details}) => {
  const name = details.name.toUpperCase();
  const model = formatParagraphs(details.model.toUpperCase());
  const onDiscount = details.discountStatus === "on";
  const discountPrice = onDiscount ? <p className="after-discount">{details.discountPrice},-</p> : "";
  const smallHeader = name.length > 7 ? "smaller" : "";
  return (
      <div>
        <div className="half-tag">
          <div className="text-content">
            <h3 className={smallHeader}>{name}</h3>
            {model}
            <p className={onDiscount ? "before-discount" : "after-discount"}>{details.price},-</p>
            {discountPrice}
          </div>
        </div>
        <div className="half-tag">
          <div className="text-content">
            <h3 className={smallHeader}>{name}</h3>
            {model}
            <p className={onDiscount ? "before-discount" : "after-discount"}>{details.price},-</p>
            {discountPrice}
          </div>
        </div>
      </div>
  );
};

Pricetag.propTypes = {
  details: PropTypes.object.isRequired
}

/* Fixes issue that Pricetags are rendered after order is initialized, but apparently 
   items are not yet initialized, causing React trying to render Pricetag with details of 
   undefined */

Pricetag.defaultProps = {
  details: {
    name: "default",
    model: "default",
    price: 999,
    discountPrice: 999,
    discountStatus: "off"
  }
}

export default Pricetag;
import React from "react";
import "../styles/Pricetag.css";
import PropTypes from "prop-types";

class Pricetag extends React.Component {
  render() {
    const { details } = this.props;
    const onDiscount = details.discountStatus === "on";
    const discountPrice = onDiscount ? <p>{details.discountPrice},-</p> : "";
    return (
      <div>
        <div className="half-tag">
          <div className="text-content">
            <h2>{details.name.toUpperCase()}</h2>
            <h4>{details.model.toUpperCase()}</h4>
            <p className={onDiscount ? "before-discount" : ""}>{details.price},-</p>
            {discountPrice}
          </div>
        </div>
        <div className="half-tag">
          <div className="text-content">
            <h2>{details.name.toUpperCase()}</h2>
            <h4>{details.model.toUpperCase()}</h4>
            <p className={onDiscount ? "before-discount" : ""}>{details.price},-</p>
            {discountPrice}
          </div>
        </div>
      </div>
    );
  }
}

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
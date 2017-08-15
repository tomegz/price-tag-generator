import React from "react";
import "../styles/Pricetag.css";

class Pricetag extends React.Component {
  render() {
    const { details } = this.props;
    const onDiscount = details.discountStatus === "on";
    const discountPrice = onDiscount ? <p>{details.discountPrice},-</p> : "";
    return (
      <div>
        <div className="half-tag">
          <div className="text-content">
            <h2>{details.name}</h2>
            <h4>{details.model}</h4>
            <p className={onDiscount ? "before-discount" : ""}>{details.price},-</p>
            {discountPrice}
          </div>
        </div>
        <div className="half-tag">
          <div className="text-content">
            <h2>{details.name}</h2>
            <h4>{details.model}</h4>
            <p className={onDiscount ? "before-discount" : ""}>{details.price},-</p>
            {discountPrice}
          </div>
        </div>
      </div>
    );
  }
}

export default Pricetag;
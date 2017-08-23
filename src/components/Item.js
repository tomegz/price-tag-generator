import React from "react";
import PropTypes from "prop-types";

class Item extends React.Component {
  render() {
    const { details, index } = this.props;
    const isOnDiscount = details.discountStatus === "on";
    return (
      <li className="menu-item">
        <p><strong>{`${details.name} ${details.model}`}</strong></p>
        <span className="price">{details.price}</span>
        {isOnDiscount ? <span className="discountPrice">{details.discountPrice}</span> : ""}
        <button onClick={() => this.props.addToOrder(index)}>+</button>
      </li>
    );
  }
}

Item.propTypes = {
  details: PropTypes.object.isRequired,
  index: PropTypes.string.isRequired,
  addToOrder: PropTypes.func.isRequired
}

export default Item;
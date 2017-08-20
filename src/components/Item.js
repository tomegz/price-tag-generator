import React from "react";

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

export default Item;
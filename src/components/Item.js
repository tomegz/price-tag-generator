import React from "react";

class Item extends React.Component {
  render() {
    const { details, index } = this.props;
    const isOnDiscount = details.discountStatus === "on";
    return (
      <li className="menu-item">
        <h4>{`${details.name} ${details.model}`}</h4>
        <span className="price">{details.price}</span>
        {isOnDiscount ? <span className="discountPrice">{details.discountPrice}</span> : ""}
        <button onClick={() => this.props.addToOrder(index)}>Drukuj</button>
      </li>
    );
  }
}

export default Item;
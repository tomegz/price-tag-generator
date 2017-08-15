import React from "react";

class Item extends React.Component {
  render() {
    const { details } = this.props;
    return (
      <li className="menu-item">
        <h4>{`${details.name} ${details.model}`}</h4>
        <span className="price">{details.price}</span>
        <span className="discountPrice">{details.discountPrice}</span>
        <button>Drukuj</button>
      </li>
    );
  }
}

export default Item;
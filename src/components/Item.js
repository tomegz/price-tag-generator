import React, { Component } from "react";
import PropTypes from "prop-types";

class Item extends Component {
  constructor() {
    super();
    this.state = { count: 1 };
    this.handleChange = this.handleChange.bind(this);
  }

  getNameAndModel = () => {
    const { details: { name, model } } = this.props;
    return `${name} ${model}`;
  }

  handleChange(e) {
    const count = Number(e.target.value);
    this.setState({ count });
  }

  handleItemRemove = () => {
    const { index: id, removeItem } = this.props;
    const itemName = this.getNameAndModel();
    const confirmed = window.confirm(`Czy na pewno chcesz usunąć ${itemName} z bazy cen?`);
    if (confirmed) {
      removeItem(id);
    }
  }

  render() {
    const { details, index, addToOrder } = this.props;
    const isOnDiscount = details.discountStatus === "on";
    return (
      <li className="menu-item">
        <div className="menu-item-inner">
          <div className="desc">
            <div className="desc-header">
              <h5><strong>{this.getNameAndModel()}</strong></h5>
              <i className="remove-icon fa fa-trash" onClick={this.handleItemRemove} />
            </div>
            <p><i className="fa fa-calendar" /> {`${details.year || "-"}`}</p>
            <p>
              <i className="fa fa-money" />
              <span className={isOnDiscount ? "price" : ""}> {details.price} </span>
              {isOnDiscount ? <span>{details.discountPrice}</span> : ""}
            </p>
          </div>
          <div className="adding-section">
            <input className="item-amount" type="number" defaultValue={this.state.count}
                                                         min="1"
                                                         max="99"
                                                         onChange={this.handleChange} />
            <button onClick={() => addToOrder(index, this.state.count)}>
              <i className="fa fa-plus" aria-hidden="true" />
            </button>
          </div>
        </div>
      </li>
    );
  }
}

Item.propTypes = {
  details: PropTypes.object.isRequired,
  index: PropTypes.string.isRequired,
  addToOrder: PropTypes.func.isRequired,
  removeItem: PropTypes.func.isRequired,
}

export default Item;
import React, { Component } from "react";
import PropTypes from "prop-types";

class Item extends Component {
  constructor() {
    super();
    this.state = { count: 1 };
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {
    const count = Number(e.target.value);
    this.setState({ count });
  }
  render() {
    const { details, index, addToOrder } = this.props;
    const isOnDiscount = details.discountStatus === "on";
    return (
      <li className="menu-item">
        <div>
          <div className="desc">  
            <h5><strong>{`${details.name} ${details.model}`}</strong></h5>
            <p><i className="fa fa-calendar" /> {`${details.year || "-"}`}</p>
            <p>
              <i className="fa fa-money" />
              <span className={isOnDiscount ? "price" : ""}> {details.price} </span>
              {isOnDiscount ? <span>{details.discountPrice}</span> : ""}
            </p>
          </div>
          <div className="adding-section">
            <input className="item-amount" type="number" defaultValue="1"
                                                         min="0"
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
  addToOrder: PropTypes.func.isRequired
}

export default Item;
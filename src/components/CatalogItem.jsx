import React, { Component } from "react";
import PropTypes from "prop-types";

class CatalogItem extends Component {
  constructor() {
    super();
    this.state = { count: 1 };
    this.handleChange = this.handleChange.bind(this);
  }

  getNameAndModel = () => {
    const { item: { name, model } } = this.props;
    return `${name} ${model}`;
  }

  handleChange(e) {
    const count = Number(e.target.value);
    this.setState({ count });
  }

  handleItemRemove = () => {
    const { index: id, removeCatalogItem } = this.props;
    const itemName = this.getNameAndModel();
    const confirmed = window.confirm(`Czy na pewno chcesz usunąć ${itemName} z bazy cen?`);
    if (confirmed) {
      removeCatalogItem(id);
    }
  }

  render() {
    const { item, index, enqueuePrintTags } = this.props;
    const isOnDiscount = item.discountStatus === "on";
    return (
      <li className="catalog-menu-item">
        <div className="catalog-menu-item-inner">
          <div className="desc">
            <div className="desc-header">
              <h5><strong>{this.getNameAndModel()}</strong></h5>
              <i className="remove-icon fa fa-trash" onClick={this.handleItemRemove} />
            </div>
            <p><i className="fa fa-calendar" /> {`${item.year || "-"}`}</p>
            <p>
              <i className="fa fa-money" />
              <span className={isOnDiscount ? "price" : ""}> {item.price} </span>
              {isOnDiscount ? <span>{item.discountPrice}</span> : ""}
            </p>
          </div>
          <div className="adding-section">
            <input className="item-amount" type="number" defaultValue={this.state.count}
                                                         min="1"
                                                         max="99"
                                                         onChange={this.handleChange} />
            <button onClick={() => enqueuePrintTags(index, this.state.count)}>
              <i className="fa fa-plus" aria-hidden="true" />
            </button>
          </div>
        </div>
      </li>
    );
  }
}

CatalogItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.string.isRequired,
  enqueuePrintTags: PropTypes.func.isRequired,
  removeCatalogItem: PropTypes.func.isRequired,
}

export default CatalogItem;

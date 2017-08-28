import React, { Component } from 'react';
import PropTypes from "prop-types";

import Item from "./Item";
import FilterSelect from "./FilterSelect";
import "../styles/Menu.css";

class Menu extends Component {
  constructor() {
    super();
    this.filterItems = this.filterItems.bind(this);
  }
  filterItems(keys) {
    const { items, currentBrand } = this.props;
    if(currentBrand === "Wszystkie marki") {
      return keys;
    }
    return keys.filter(key => items[key].name === currentBrand);
  }
  render() {
    const { items, brands, addToOrder } = this.props;
    const itemsToRender = this.filterItems(Object.keys(items));
    return (
      <div className="menu">
        <h2>Menu</h2>
        <FilterSelect brands={brands} chooseBrand={this.props.chooseBrand} />
        <ul className="list-of-items">
          {itemsToRender.map((key) => <Item key={key} index={key} details={items[key]} addToOrder={addToOrder} />)}
        </ul>
      </div>
    );
  }
}

Menu.propTypes = {
  items: PropTypes.object.isRequired,
  brands: PropTypes.array.isRequired,
  addToOrder: PropTypes.func.isRequired
}

export default Menu;
import React, { Component } from 'react';
import PropTypes from "prop-types";

import Item from "./Item";
import FindItemBar from "./FindItemBar";
import "../styles/Menu.css";

class Menu extends Component {
  constructor() {
    super();
    this.filterItems = this.filterItems.bind(this);
  }
  filterItems(keys){
    const { items, searchQuery } = this.props;
    const filteredItems = keys.filter( key => {
      const isNameValid = items[key].name.toLowerCase().indexOf(searchQuery) !== -1;
      const isModelValid = items[key].model.toLowerCase().indexOf(searchQuery) !== -1;
      return isNameValid || isModelValid;
    });
    return filteredItems;
  }
  render() {
    const { items, addToOrder, setSearchQuery } = this.props;
    const itemsToRender = this.filterItems(Object.keys(items));
    return (
      <div className="menu">
        <h2>Menu</h2>
        <FindItemBar setSearchQuery={setSearchQuery} />
        <ul className="list-of-items">
          {itemsToRender.map((key) => <Item key={key} index={key} details={items[key]} addToOrder={addToOrder} />)}
        </ul>
      </div>
    );
  }
}

Menu.propTypes = {
  items: PropTypes.object.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  addToOrder: PropTypes.func.isRequired
}

export default Menu;
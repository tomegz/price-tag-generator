import React from 'react';
import PropTypes from "prop-types";

import Item from "./Item";
import FindItemBar from "./FindItemBar";
import "../styles/Menu.css";

const Menu = ({items, setSearchQuery, searchQuery, addToOrder}) => {
  const filterItems = (keys) => {
    const filteredItems = keys.filter( key => {
      const isNameValid = items[key].name.toLowerCase().indexOf(searchQuery) !== -1;
      const isModelValid = items[key].model.toLowerCase().indexOf(searchQuery) !== -1;
      return isNameValid || isModelValid;
    });
    return filteredItems;
  };
  const itemsToRender = filterItems(Object.keys(items));
  return (
      <div className="menu">
        <h2>Menu</h2>
        <FindItemBar setSearchQuery={setSearchQuery} />
        <ul className="list-of-items">
          {itemsToRender.map((key) => <Item key={key} index={key} details={items[key]} addToOrder={addToOrder} />)}
        </ul>
      </div>
  );
};

Menu.propTypes = {
  items: PropTypes.object.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  addToOrder: PropTypes.func.isRequired
}

export default Menu;
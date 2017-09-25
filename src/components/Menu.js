import React from 'react';
import PropTypes from "prop-types";

import Item from "./Item";
import FindItemBar from "./FindItemBar";
import "../styles/Menu.css";

const Menu = ({items, itemsToRender, setSearchQuery, searchQuery, addToOrder}) => {
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
  itemsToRender: PropTypes.array.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  addToOrder: PropTypes.func.isRequired
}

export default Menu;
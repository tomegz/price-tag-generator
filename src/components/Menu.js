import React, { Component } from 'react';
import PropTypes from "prop-types";

import Item from "./Item";
import "../styles/Menu.css";

class Menu extends Component {
  render() {
    const { items } = this.props;
    return (
      <div className="menu">
        <h2>Menu</h2>
        <ul className="list-of-items">
          {Object.keys(items)
                 .map((key) => <Item key={key} index={key} details={items[key]} addToOrder={this.props.addToOrder} />)}
        </ul>
      </div>
    );
  }
}

Menu.propTypes = {
  items: PropTypes.object.isRequired,
  addToOrder: PropTypes.func.isRequired
}

export default Menu;
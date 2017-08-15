import React, { Component } from 'react';

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

export default Menu;
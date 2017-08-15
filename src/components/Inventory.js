import React, { Component } from 'react';

import AddItemForm from "./AddItemForm";
import "../styles/Inventory.css";

class Inventory extends Component {
  constructor() {
    super();
    this.renderItem = this.renderItem.bind(this);
  }
  renderItem(key) {
    const item = this.props.items[key];
    return (
      <div key={key}>
        <h4>{item.name}</h4>
        <p>{item.price}</p>
      </div>
    );
  }
  render() {
    const { items } = this.props;
    return (
      <div className="inventory">
        <h2>Inventory</h2>
        {Object.keys(items)
               .map(this.renderItem)}
        <AddItemForm addItem={this.props.addItem} />
      </div>
    );
  }
}

export default Inventory;
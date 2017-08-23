import React, { Component } from 'react';
import PropTypes from "prop-types";

import AddItemForm from "./AddItemForm";
import "../styles/Inventory.css";

class Inventory extends Component {
  constructor() {
    super();
    this.renderItem = this.renderItem.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e, key) {
    const item = this.props.items[key];
    const updatedItem = {
      ...item,
      [e.target.name]: e.target.value
    }
    console.log(updatedItem);
    this.props.updateItem(key, updatedItem);
  }
  renderItem(key) {
    const item = this.props.items[key];
    return (
      <div className="item-edit" key={key}>
        <input type="text" name="name" value={item.name} placeholder="Marka produktu" onChange={(e) => this.handleChange(e, key)}/>
        <input type="text" name="model" value={item.model} placeholder="Nazwa modelu" onChange={(e) => this.handleChange(e, key)}/>
        <input type="text" name="price" value={item.price} placeholder="Cena produktu" onChange={(e) => this.handleChange(e, key)}/>
        <select type="text" name="discountStatus" value={item.discountStatus} placeholder="Status promocji" onChange={(e) => this.handleChange(e, key)}>
          <option value="on">Promocja włączona</option>
          <option value="off">Promocja wyłączona</option>
        </select>
        <input type="text" name="discountPrice" value={item.discountPrice} placeholder="Cena promocyjna" onChange={(e) => this.handleChange(e, key)}/>
      </div>
    );
  }
  render() {
    const { items } = this.props;
    return (
      <div className="inventory">
        <h2>Edycja cen</h2>
        {Object.keys(items)
               .map(this.renderItem)}
        <AddItemForm addItem={this.props.addItem} />
      </div>
    );
  }
}

Inventory.propTypes = {
  items: PropTypes.object.isRequired,
  addItem: PropTypes.func.isRequired,
  updateItem: PropTypes.func.isRequired
}

export default Inventory;
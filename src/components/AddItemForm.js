import React from "react";
import PropTypes from "prop-types";

class AddItemForm extends React.Component {
  constructor() {
    super();
    this.createItem = this.createItem.bind(this);
  }
  createItem(e) {
    e.preventDefault();
    const item = {
      name: this.name.value,
      model: this.model.value,
      price: this.price.value,
      discountPrice: this.discountPrice.value,
      discountStatus: this.discountStatus.value
    };
    this.props.addItem(item);
    this.itemForm.reset();
  }
  render() {
    return (
      <div className="add-item-wrapper">
        <h4>Dodaj nową cenę</h4>
        <form ref={(input) => this.itemForm = input} className="add-item" onSubmit={this.createItem}>
          <input ref={(input) => this.name = input} type="text" placeholder="Marka" required />
          <input ref={(input) => this.model = input} type="text" placeholder="Model" required  />
          <input ref={(input) => this.price = input} type="text" placeholder="Cena" required />
          <select ref={(input) => this.discountStatus = input}>
            <option value="on">Promocja włączona</option>
            <option value="off">Promocja wyłączona</option>
          </select>
          <input ref={(input) => this.discountPrice = input} type="text" placeholder="Cena promocyjna" required />
          <button type="submit"><strong>+ DODAJ</strong></button>
        </form>
      </div>
    );
  }
}

AddItemForm.propTypes = {
  addItem: PropTypes.func.isRequired
}

export default AddItemForm;
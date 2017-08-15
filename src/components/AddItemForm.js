import React from "react";

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
      <form ref={(input) => this.itemForm = input} className="add-item" onSubmit={this.createItem}>
        <input ref={(input) => this.name = input} type="text" placeholder="Marka" />
        <input ref={(input) => this.model = input} type="text" placeholder="Model" />
        <input ref={(input) => this.price = input} type="text" placeholder="Cena" />
        <input ref={(input) => this.discountPrice = input} type="text" placeholder="Cena promocyjna" />
        <select ref={(input) => this.discountStatus = input}>
          <option value="on">Promocja włączona</option>
          <option value="off">Promocja wyłączona</option>
        </select>
        <button type="submit">Dodaj</button>
      </form>
    );
  }
}

export default AddItemForm;
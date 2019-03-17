import React from "react";
import PropTypes from "prop-types";

const getCurrentYear = () => {
  return new Date().getFullYear();
};

const CURRENT_YEAR = getCurrentYear();

const getAvailableYears = () => {
  return [
    CURRENT_YEAR - 3,
    CURRENT_YEAR - 2,
    CURRENT_YEAR -1,
    CURRENT_YEAR,
    CURRENT_YEAR + 1,
  ];
};

const AVAILABLE_YEARS = getAvailableYears();
const AVAILABLE_OPTIONS = ['-', ...AVAILABLE_YEARS];

const initialState = {
  name: '',
  price: '',
  model: '',
  discountPrice: '',
  year: CURRENT_YEAR,
  discountStatus: '',
}

class AddItemForm extends React.Component {
  state = {
    ...initialState,
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState(state => ({
      ...state,
      [name]: value,
    }));
  };

  createItem = (e) => {
    const { addItem } = this.props;

    addItem({
      name: this.state.name,
      model: this.state.model,
      price: Number(this.state.price),
      year: this.state.year,
      discountPrice: Number(this.state.discountPrice),
      discountStatus: this.state.discountStatus,
    });
    this.resetForm();
    e.preventDefault();
  };

  resetForm = () => {
    this.setState({ ...initialState });
  }

  render() {
    const {
      name,
      model,
      price,
      year,
      discountPrice,
      discountStatus,
    } = this.state;

    return (
      <div className="add-item-wrapper">
          <h4>Dodaj nową cenę</h4>
          <form className="add-item" onSubmit={this.createItem}>
            <input name="name" value={name} onChange={this.handleChange} type="text" placeholder="Marka" required />
            <input name="model" value={model} onChange={this.handleChange} type="text" placeholder="Model" required />
            <select name="year" value={year} onChange={this.handleChange}>
              {AVAILABLE_OPTIONS.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
            <input name="price" value={price} onChange={this.handleChange} type="text" placeholder="Cena" required />
            <select name="discountStatus" value={discountStatus} onChange={this.handleChange}>
              <option value="on">Promocja włączona</option>
              <option value="off">Promocja wyłączona</option>
            </select>
            <input name="discountPrice" value={discountPrice} onChange={this.handleChange} type="text" placeholder="Cena promocyjna" required />
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
import React, { Component } from "react";
import PropTypes from "prop-types";

class FilterSelect extends Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {
    this.props.chooseBrand(e.target.value);
  }
  render() {
    const brands = [...this.props.brands];
    return (
      <select type="text" placeholder="Marka" defaultValue="Wszystkie marki" onChange={(e) => this.handleChange(e)}>
        <option>Wszystkie marki</option>
        {brands.map((brand, i) => <option key={i}>{brand}</option>)}
      </select>
    );
  }
}

FilterSelect.propTypes = {
  brands: PropTypes.array.isRequired
};

export default FilterSelect;
import React, { Component } from "react";
import PropTypes from "prop-types";

class FindItemBar extends Component {
  render() {
    return (
      <input type="text" placeholder="Szukaj produktu" onChange={(e) => this.props.setSearchQuery(e.target.value)} />
    );
  }
}

FindItemBar.propTypes = {
  setSearchQuery: PropTypes.func.isRequired
}
export default FindItemBar;
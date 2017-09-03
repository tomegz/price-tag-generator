import React from "react";
import PropTypes from "prop-types";

const FindItemBar = ({setSearchQuery}) => {
  return (
    <input type="text" placeholder="Szukaj produktu" onChange={(e) => setSearchQuery(e.target.value)} />
  );
};

FindItemBar.propTypes = {
  setSearchQuery: PropTypes.func.isRequired
}
export default FindItemBar;
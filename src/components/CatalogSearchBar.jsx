import React from "react";
import PropTypes from "prop-types";

const CatalogSearchBar = ({setSearchQuery}) => {
  return (
    <input type="text" placeholder="Szukaj produktu" onChange={(e) => setSearchQuery(e.target.value)} />
  );
};

CatalogSearchBar.propTypes = {
  setSearchQuery: PropTypes.func.isRequired
}
export default CatalogSearchBar;

import React from 'react';
import PropTypes from "prop-types";

import CatalogItem from "./CatalogItem";
import CatalogSearchBar from "./CatalogSearchBar";
import "../styles/CatalogMenu.css";

const CatalogMenu = ({
  catalogItems,
  catalogItemIds,
  setSearchQuery,
  searchQuery,
  enqueuePrintTags,
  removeCatalogItem
}) => {
  return (
      <div className="catalog-menu">
        <h2>Menu</h2>
        <CatalogSearchBar setSearchQuery={setSearchQuery} />
        <ul className="catalog-item-list">
          {catalogItemIds.map((key) => (
            <CatalogItem key={key}
                         index={key}
                         item={catalogItems[key]}
                         enqueuePrintTags={enqueuePrintTags}
                         removeCatalogItem={removeCatalogItem} />
          ))}
        </ul>
      </div>
  );
};

CatalogMenu.propTypes = {
  catalogItems: PropTypes.object.isRequired,
  catalogItemIds: PropTypes.array.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  enqueuePrintTags: PropTypes.func.isRequired,
  removeCatalogItem: PropTypes.func.isRequired,
}

export default CatalogMenu;

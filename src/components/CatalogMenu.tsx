import CatalogItem from "./CatalogItem";
import CatalogSearchBar from "./CatalogSearchBar";
import type { CatalogItemsById } from "../domains/catalog/catalog";
import "../styles/CatalogMenu.css";

type CatalogMenuProps = {
  catalogItems: CatalogItemsById;
  catalogItemIds: string[];
  setSearchQuery(text: string): void;
  searchQuery: string;
  enqueuePrintTags(itemId: string, quantity: number): void;
  removeCatalogItem(itemId: string): void;
};

const CatalogMenu = ({
  catalogItems,
  catalogItemIds,
  setSearchQuery,
  enqueuePrintTags,
  removeCatalogItem
}: CatalogMenuProps) => {
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

export default CatalogMenu;

import { useState, type ChangeEvent } from "react";

import type { LegacyCatalogItem } from "../domains/catalog/catalog";

type CatalogItemProps = {
  item: LegacyCatalogItem;
  index: string;
  enqueuePrintTags(itemId: string, quantity: number): void;
  removeCatalogItem(itemId: string): void;
};

const CatalogItem = ({
  item,
  index,
  enqueuePrintTags,
  removeCatalogItem
}: CatalogItemProps) => {
  const [count, setCount] = useState(1);

  const getNameAndModel = () => {
    const { name, model } = item;
    return `${name} ${model}`;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCount(Number(e.target.value));
  };

  const handleItemRemove = () => {
    const itemName = getNameAndModel();
    const confirmed = window.confirm(`Czy na pewno chcesz usunąć ${itemName} z bazy cen?`);
    if (confirmed) {
      removeCatalogItem(index);
    }
  };

  const isOnDiscount = item.discountStatus === "on";
  return (
    <li className="catalog-menu-item">
      <div className="catalog-menu-item-inner">
        <div className="desc">
          <div className="desc-header">
            <h5><strong>{getNameAndModel()}</strong></h5>
            <i className="remove-icon fa fa-trash" onClick={handleItemRemove} />
          </div>
          <p><i className="fa fa-calendar" /> {`${item.year || "-"}`}</p>
          <p>
            <i className="fa fa-money" />
            <span className={isOnDiscount ? "price" : ""}> {item.price} </span>
            {isOnDiscount ? <span>{item.discountPrice}</span> : ""}
          </p>
        </div>
        <div className="adding-section">
          <input className="item-amount" type="number" defaultValue={count}
                                                       min="1"
                                                       max="99"
                                                       onChange={handleChange} />
          <button onClick={() => enqueuePrintTags(index, count)}>
            <i className="fa fa-plus" aria-hidden="true" />
          </button>
        </div>
      </div>
    </li>
  );
};

export default CatalogItem;

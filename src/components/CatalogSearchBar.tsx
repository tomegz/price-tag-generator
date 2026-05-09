import type { ChangeEvent } from "react";

type CatalogSearchBarProps = {
  setSearchQuery(text: string): void;
};

const CatalogSearchBar = ({ setSearchQuery }: CatalogSearchBarProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <input type="text" placeholder="Szukaj produktu" onChange={handleChange} />
  );
};

export default CatalogSearchBar;

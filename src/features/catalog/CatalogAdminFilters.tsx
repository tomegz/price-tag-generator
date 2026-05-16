import FilterPills from "@/design-system/FilterPills";
import SearchInput from "@/design-system/SearchInput";
import type { CatalogFilterOption } from "./catalogAdminTypes";

type CatalogAdminFiltersProps = {
  brand: string;
  brandOptions: CatalogFilterOption[];
  filteredCount: number;
  query: string;
  totalCount: number;
  year: string;
  yearOptions: CatalogFilterOption[];
  onBrandChange(brand: string): void;
  onQueryChange(query: string): void;
  onYearChange(year: string): void;
};

const CatalogAdminFilters = ({
  brand,
  brandOptions,
  filteredCount,
  onBrandChange,
  onQueryChange,
  onYearChange,
  query,
  totalCount,
  year,
  yearOptions
}: CatalogAdminFiltersProps) => (
  <section className="admin-filters">
    <SearchInput
      aria-label="Szukaj w cenniku"
      onChange={event => onQueryChange(event.target.value)}
      placeholder="Szukaj marki lub modelu..."
      value={query}
    />
    <div className="admin-filters__years">
      <span className="admin-filters__label pb-mono">ROCZNIK</span>
      <FilterPills
        ariaLabel="Filtr rocznika"
        mono
        onChange={onYearChange}
        options={yearOptions}
        value={year}
      />
    </div>
    <div className="admin-filters__brands">
      <span className="admin-filters__label pb-mono">MARKA</span>
      <FilterPills ariaLabel="Filtr marki" grow onChange={onBrandChange} options={brandOptions} value={brand} />
    </div>
    <span className="admin-filters__count pb-mono">
      {filteredCount} / {totalCount}
    </span>
  </section>
);

export default CatalogAdminFilters;

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CatalogProduct } from "../../domains/catalog/catalogProduct";
import CatalogAdminScreen from "./CatalogAdminScreen";

const products: CatalogProduct[] = [
  {
    brand: "Kross",
    discountPrice: 0,
    discountEnabled: false,
    id: "item-2026",
    model: "Level",
    price: 1000,
    year: 2026,
    yearLabel: "2026"
  },
  {
    brand: "Giant",
    discountPrice: 0,
    discountEnabled: false,
    id: "item-2025",
    model: "Talon",
    price: 2000,
    year: 2025,
    yearLabel: "2025"
  },
  {
    brand: "Trek",
    discountPrice: 0,
    discountEnabled: false,
    id: "item-2024",
    model: "Marlin",
    price: 3000,
    year: 2024,
    yearLabel: "2024"
  }
];

function renderCatalogAdmin(catalogProducts = products) {
  return render(
    <CatalogAdminScreen
      brands={["Giant", "Kross", "Trek"]}
      catalogError=""
      onAddProduct={vi.fn(async () => undefined)}
      onApplyBulkPromotion={vi.fn(async () => undefined)}
      onBackToPrint={vi.fn()}
      onDeleteProduct={vi.fn(async () => undefined)}
      onDeleteProducts={vi.fn(async () => undefined)}
      onUpdateProduct={vi.fn(async () => undefined)}
      products={catalogProducts}
    />
  );
}

describe("CatalogAdminScreen", () => {
  it("shows all rocznik filters and composes filtering", async () => {
    const user = userEvent.setup();
    renderCatalogAdmin();

    const yearFilters = screen.getByRole("group", { name: "Filtr rocznika" });
    expect(within(yearFilters).getByRole("button", { name: "Wszystkie" })).toBeInTheDocument();
    expect(within(yearFilters).getByRole("button", { name: "2026" })).toBeInTheDocument();
    expect(within(yearFilters).getByRole("button", { name: "2025" })).toBeInTheDocument();
    expect(within(yearFilters).getByRole("button", { name: "2024" })).toBeInTheDocument();

    await user.click(within(yearFilters).getByRole("button", { name: "2025" }));

    expect(screen.getByText("Talon")).toBeInTheDocument();
    expect(screen.queryByText("Level")).not.toBeInTheDocument();
  });

  it("keeps selected hidden rows visible in the floating pill hint", async () => {
    const user = userEvent.setup();
    renderCatalogAdmin();

    const yearFilters = screen.getByRole("group", { name: "Filtr rocznika" });
    const modeToggle = screen.getByRole("group", { name: "Tryb edycji cennika" });
    await user.click(within(yearFilters).getByRole("button", { name: "2026" }));
    await user.click(within(modeToggle).getByRole("button", { name: "Edycja zbiorcza" }));
    await user.click(screen.getByRole("checkbox", { name: "Zaznacz wszystko" }));
    await user.click(within(yearFilters).getByRole("button", { name: "2025" }));

    expect(screen.getByText("1 ukryty przez filtr")).toBeInTheDocument();
  });

  it("falls back to all filters when the selected brand or rocznik disappears", async () => {
    const user = userEvent.setup();
    const view = renderCatalogAdmin();

    const yearFilters = screen.getByRole("group", { name: "Filtr rocznika" });
    const brandFilters = screen.getByRole("group", { name: "Filtr marki" });
    await user.click(within(yearFilters).getByRole("button", { name: "2024" }));
    await user.click(within(brandFilters).getByRole("button", { name: "Trek" }));

    view.rerender(
      <CatalogAdminScreen
        brands={["Giant", "Kross", "Trek"]}
        catalogError=""
        onAddProduct={vi.fn(async () => undefined)}
        onApplyBulkPromotion={vi.fn(async () => undefined)}
        onBackToPrint={vi.fn()}
        onDeleteProduct={vi.fn(async () => undefined)}
        onDeleteProducts={vi.fn(async () => undefined)}
        onUpdateProduct={vi.fn(async () => undefined)}
        products={products.filter(product => product.id !== "item-2024")}
      />
    );

    expect(await screen.findByText("Level")).toBeInTheDocument();
    expect(within(yearFilters).getByRole("button", { name: "Wszystkie", pressed: true })).toBeInTheDocument();
    expect(within(brandFilters).getByRole("button", { name: "Wszystkie", pressed: true })).toBeInTheDocument();
  });

  it("prefills new product brand and rocznik from active filters", async () => {
    const user = userEvent.setup();
    renderCatalogAdmin();

    const yearFilters = screen.getByRole("group", { name: "Filtr rocznika" });
    const brandFilters = screen.getByRole("group", { name: "Filtr marki" });
    await user.click(within(yearFilters).getByRole("button", { name: "2025" }));
    await user.click(within(brandFilters).getByRole("button", { name: "Giant" }));
    await user.click(screen.getByRole("button", { name: "Dodaj produkt" }));

    const addRow = screen.getByTestId("admin-add-row");
    expect(within(addRow).getByLabelText("Marka")).toHaveValue("Giant");
    expect(within(addRow).getByLabelText("Rocznik")).toHaveValue("2025");
  });

  it("prefills new product rocznik with the current year when all years are selected", async () => {
    const user = userEvent.setup();
    renderCatalogAdmin();

    await user.click(screen.getByRole("button", { name: "Dodaj produkt" }));

    const addRow = screen.getByTestId("admin-add-row");
    expect(within(addRow).getByLabelText("Marka")).toHaveValue("");
    expect(within(addRow).getByLabelText("Rocznik")).toHaveValue(String(new Date().getFullYear()));
  });
});

import type { ComponentProps } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CatalogProduct } from "@/domains/catalog/catalogProduct";
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

type CatalogAdminProps = ComponentProps<typeof CatalogAdminScreen>;

function getAdminProductRow(text: string): HTMLElement {
  const row = screen.getByText(text).closest('[data-testid="admin-product-row"]');
  if (!(row instanceof HTMLElement)) {
    throw new Error(`Could not find admin product row containing ${text}.`);
  }
  return row;
}

function renderCatalogAdmin(
  catalogProducts = products,
  overrides: Partial<CatalogAdminProps> = {}
) {
  const props: CatalogAdminProps = {
    brands: ["Giant", "Kross", "Trek"],
    catalogError: "",
    onAddProduct: vi.fn(async () => undefined),
    onApplyBulkPromotion: vi.fn(async () => undefined),
    onBackToPrint: vi.fn(),
    onDeleteProduct: vi.fn(async () => undefined),
    onDeleteProducts: vi.fn(async () => undefined),
    onUpdateProduct: vi.fn(async () => undefined),
    products: catalogProducts,
    ...overrides
  };

  return {
    props,
    ...render(<CatalogAdminScreen {...props} />)
  };
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

  it("saves an edited product only after a dirty valid change", async () => {
    const user = userEvent.setup();
    const { props } = renderCatalogAdmin();

    await user.click(within(getAdminProductRow("Level")).getByRole("button", { name: "Edytuj" }));
    const editRow = screen.getByDisplayValue("Level").closest('[data-testid="admin-product-row"]');
    if (!(editRow instanceof HTMLElement)) throw new Error("Expected editable product row.");
    const saveButton = within(editRow).getByRole("button", { name: "Zapisz" });

    expect(saveButton).toBeDisabled();

    await user.clear(within(editRow).getByLabelText("Model"));
    await user.type(within(editRow).getByLabelText("Model"), "Level X");
    await user.click(saveButton);

    await waitFor(() => {
      expect(props.onUpdateProduct).toHaveBeenCalledWith("item-2026", {
        brand: "Kross",
        discountEnabled: false,
        discountPrice: 0,
        model: "Level X",
        price: 1000,
        year: "2026"
      });
    });
  });

  it("adds a valid product and closes the add row", async () => {
    const user = userEvent.setup();
    const { props } = renderCatalogAdmin();

    await user.click(screen.getByRole("button", { name: "Dodaj produkt" }));

    const addRow = screen.getByTestId("admin-add-row");
    const saveButton = within(addRow).getByRole("button", { name: "Zapisz" });
    expect(saveButton).toBeDisabled();

    await user.type(within(addRow).getByLabelText("Marka"), "  Orbea  ");
    await user.type(within(addRow).getByLabelText("Model"), "  Laufey  ");
    await user.clear(within(addRow).getByLabelText("Rocznik"));
    await user.type(within(addRow).getByLabelText("Rocznik"), "2026");
    await user.type(within(addRow).getByLabelText("Cena katalogowa"), "4299");
    await user.click(within(addRow).getByRole("checkbox", { name: "Promocja aktywna" }));
    await user.type(within(addRow).getByLabelText("Cena promocyjna"), "3999");
    await user.click(saveButton);

    await waitFor(() => {
      expect(props.onAddProduct).toHaveBeenCalledWith({
        brand: "Orbea",
        discountEnabled: true,
        discountPrice: 3999,
        model: "Laufey",
        price: 4299,
        year: "2026"
      });
    });
    await waitFor(() => expect(screen.queryByTestId("admin-add-row")).not.toBeInTheDocument());
  });

  it("preserves inactive promotion status when an item has a stored promotion price", async () => {
    const user = userEvent.setup();
    const onUpdateProduct = vi.fn(async () => undefined);
    const catalogProducts: CatalogProduct[] = [
      {
        brand: "Kross",
        discountPrice: 14500,
        discountEnabled: false,
        id: "item-dormant-promo",
        model: "Moon",
        price: 14999,
        year: 2026,
        yearLabel: "2026"
      }
    ];
    renderCatalogAdmin(catalogProducts, { onUpdateProduct });

    const row = screen.getByTestId("admin-product-row");
    expect(within(row).getByText("—")).toBeInTheDocument();

    await user.click(within(row).getByRole("button", { name: "Edytuj" }));

    const editedRow = screen.getByTestId("admin-product-row");
    expect(within(editedRow).getByRole("checkbox", { name: "Promocja aktywna" })).not.toBeChecked();
    expect(within(editedRow).getByLabelText("Cena promocyjna")).toHaveValue("14500");
    expect(within(editedRow).getByLabelText("Cena promocyjna")).toBeDisabled();

    await user.clear(within(editedRow).getByLabelText("Model"));
    await user.type(within(editedRow).getByLabelText("Model"), "Moon Edited");
    await user.click(within(editedRow).getByRole("button", { name: "Zapisz" }));

    await waitFor(() => {
      expect(onUpdateProduct).toHaveBeenCalledWith("item-dormant-promo", expect.objectContaining({
        discountPrice: 14500,
        discountEnabled: false,
        model: "Moon Edited"
      }));
    });
  });

  it("enables promotion explicitly from the edit row toggle", async () => {
    const user = userEvent.setup();
    const onUpdateProduct = vi.fn(async () => undefined);
    const catalogProducts: CatalogProduct[] = [
      {
        brand: "Kross",
        discountPrice: 14500,
        discountEnabled: false,
        id: "item-dormant-promo",
        model: "Moon",
        price: 14999,
        year: 2026,
        yearLabel: "2026"
      }
    ];
    renderCatalogAdmin(catalogProducts, { onUpdateProduct });

    const row = screen.getByTestId("admin-product-row");
    await user.click(within(row).getByRole("button", { name: "Edytuj" }));

    const editedRow = screen.getByTestId("admin-product-row");
    await user.click(within(editedRow).getByRole("checkbox", { name: "Promocja aktywna" }));
    await user.click(within(editedRow).getByRole("button", { name: "Zapisz" }));

    await waitFor(() => {
      expect(onUpdateProduct).toHaveBeenCalledWith("item-dormant-promo", expect.objectContaining({
        discountPrice: 14500,
        discountEnabled: true
      }));
    });
  });

  it("keeps bulk row and checkbox selection as a single toggle and clears selection when leaving bulk mode", async () => {
    const user = userEvent.setup();
    renderCatalogAdmin();

    const modeToggle = screen.getByRole("group", { name: "Tryb edycji cennika" });
    await user.click(within(modeToggle).getByRole("button", { name: "Edycja zbiorcza" }));

    const row = getAdminProductRow("Level");
    await user.click(row);
    expect(screen.getByText("wybrany wiersz")).toBeInTheDocument();

    await user.click(within(row).getByRole("checkbox", { name: /Zaznacz/ }));
    expect(screen.getByText("Zaznacz produkty, aby kontynuować")).toBeInTheDocument();

    await user.click(within(row).getByRole("checkbox", { name: /Zaznacz/ }));
    expect(screen.getByText("wybrany wiersz")).toBeInTheDocument();

    await user.click(within(modeToggle).getByRole("button", { name: "Edycja" }));
    expect(screen.queryByText("wybrany wiersz")).not.toBeInTheDocument();
    expect(screen.queryByText("Zaznacz produkty, aby kontynuować")).not.toBeInTheDocument();
  });

  it("excludes edited rows from select all in bulk mode", async () => {
    const user = userEvent.setup();
    renderCatalogAdmin();

    await user.click(within(getAdminProductRow("Level")).getByRole("button", { name: "Edytuj" }));
    const modeToggle = screen.getByRole("group", { name: "Tryb edycji cennika" });
    await user.click(within(modeToggle).getByRole("button", { name: "Edycja zbiorcza" }));
    await user.click(screen.getByRole("checkbox", { name: "Zaznacz wszystko" }));

    expect(screen.getByText("wybrane wiersze")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("keeps the quick delete dialog open when deletion fails", async () => {
    const user = userEvent.setup();
    const onDeleteProduct = vi.fn(async () => {
      throw new Error("delete failed");
    });
    renderCatalogAdmin(products, { onDeleteProduct });

    await user.click(within(getAdminProductRow("Level")).getByRole("button", { name: /Usuń/ }));
    const confirmDialog = screen.getByRole("dialog", { name: /Usuń 1 produkt/ });
    await user.click(within(confirmDialog).getByRole("button", { name: "Usuń 1" }));

    await waitFor(() => expect(onDeleteProduct).toHaveBeenCalledWith("item-2026"));
    expect(screen.getByRole("dialog", { name: /Usuń 1 produkt/ })).toBeInTheDocument();
  });
});

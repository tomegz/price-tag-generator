import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CatalogProduct } from "../../domains/catalog/catalogProduct";
import BulkPromotionModal from "./BulkPromotionModal";

const product: CatalogProduct = {
  brand: "Kross",
  discountPrice: 0,
  discountEnabled: false,
  id: "item1",
  model: "Hexagon",
  price: 1000,
  year: 2026,
  yearLabel: "2026"
};

describe("BulkPromotionModal", () => {
  it("renders one configuration step for already selected products", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn(async () => undefined);

    render(
      <BulkPromotionModal
        onApply={onApply}
        onClose={vi.fn()}
        products={[product]}
      />
    );

    expect(screen.queryByRole("button", { name: /Dalej/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Podgląd promocji")).toHaveTextContent("700 zł");

    await user.click(screen.getByRole("button", { name: /Zastosuj promocję do .*1.* produktu/ }));

    expect(onApply).toHaveBeenCalledWith(["item1"], {
      amount: 200,
      mode: "percent",
      percent: 30
    });
  });

  it("closes without applying", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <BulkPromotionModal
        onApply={vi.fn()}
        onClose={onClose}
        products={[product]}
      />
    );

    expect(screen.queryByRole("button", { name: "Zmień wybór" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Anuluj" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

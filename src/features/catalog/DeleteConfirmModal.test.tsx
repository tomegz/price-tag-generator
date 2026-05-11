import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CatalogProduct } from "../../domains/catalog/catalogProduct";
import DeleteConfirmModal from "./DeleteConfirmModal";

const product: CatalogProduct = {
  brand: "Kross",
  discountPrice: 0,
  discountEnabled: false,
  id: "item1",
  model: "Hexagon",
  price: 1299,
  year: 2026,
  yearLabel: "2026"
};

describe("DeleteConfirmModal", () => {
  it("confirms inline deletion without a typed phrase", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <DeleteConfirmModal
        mode="quick"
        onCancel={vi.fn()}
        onConfirm={onConfirm}
        products={[product]}
      />
    );

    expect(screen.queryByLabelText("Potwierdzenie usunięcia")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Usuń 1" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("requires the typed phrase for bulk deletion", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <DeleteConfirmModal
        mode="phrase"
        onCancel={vi.fn()}
        onConfirm={onConfirm}
        products={[product]}
      />
    );

    const confirmButton = screen.getByRole("button", { name: "Usuń 1" });
    expect(confirmButton).toBeDisabled();

    await user.type(screen.getByLabelText("Potwierdzenie usunięcia"), "usuń");
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

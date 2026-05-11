import { describe, expect, it } from "vitest";
import {
  additionalItemsLabel,
  editingRowsLabel,
  hiddenRowsLabel,
  productCountLabel,
  productGenitiveCountLabel,
  selectedRowsLabel
} from "./catalogAdminCopy";

describe("catalogAdminCopy", () => {
  it("uses Polish count forms for selected rows", () => {
    expect(selectedRowsLabel(0)).toBe("wybranych wierszy");
    expect(selectedRowsLabel(1)).toBe("wybrany wiersz");
    expect(selectedRowsLabel(2)).toBe("wybrane wiersze");
    expect(selectedRowsLabel(5)).toBe("wybranych wierszy");
    expect(selectedRowsLabel(22)).toBe("wybrane wiersze");
  });

  it("uses Polish count forms for hidden rows and products", () => {
    expect(hiddenRowsLabel(1)).toBe("ukryty");
    expect(hiddenRowsLabel(3)).toBe("ukryte");
    expect(hiddenRowsLabel(12)).toBe("ukrytych");
    expect(productCountLabel(1)).toBe("produkt");
    expect(productCountLabel(4)).toBe("produkty");
    expect(productCountLabel(25)).toBe("produktów");
    expect(productGenitiveCountLabel(1)).toBe("produktu");
    expect(productGenitiveCountLabel(2)).toBe("produktów");
    expect(productGenitiveCountLabel(22)).toBe("produktów");
    expect(additionalItemsLabel(22)).toBe("kolejne");
  });

  it("uses Polish count forms for edited rows", () => {
    expect(editingRowsLabel(1)).toBe("wiersz w trakcie edycji");
    expect(editingRowsLabel(2)).toBe("wiersze w trakcie edycji");
    expect(editingRowsLabel(5)).toBe("wierszy w trakcie edycji");
    expect(editingRowsLabel(22)).toBe("wiersze w trakcie edycji");
  });
});

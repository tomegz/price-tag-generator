import { getPolishPlural } from "./polishPlural";

export function selectedRowsLabel(count: number): string {
  return getPolishPlural(count, {
    one: "wybrany wiersz",
    few: "wybrane wiersze",
    many: "wybranych wierszy"
  });
}

export function hiddenRowsLabel(count: number): string {
  return getPolishPlural(count, {
    one: "ukryty",
    few: "ukryte",
    many: "ukrytych"
  });
}

export function productCountLabel(count: number): string {
  return getPolishPlural(count, {
    one: "produkt",
    few: "produkty",
    many: "produktów"
  });
}

export function productGenitiveCountLabel(count: number): string {
  return count === 1 ? "produktu" : "produktów";
}

export function additionalItemsLabel(count: number): string {
  return getPolishPlural(count, {
    one: "kolejny",
    few: "kolejne",
    many: "kolejnych"
  });
}

export function editingRowsLabel(count: number): string {
  return getPolishPlural(count, {
    one: "wiersz w trakcie edycji",
    few: "wiersze w trakcie edycji",
    many: "wierszy w trakcie edycji"
  });
}

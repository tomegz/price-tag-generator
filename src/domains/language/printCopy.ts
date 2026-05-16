import { getPolishPlural } from "./polishPlural";

export function getPriceCountWord(count: number): "cena" | "ceny" | "cen" {
  return getPolishPlural(count, {
    one: "cena",
    few: "ceny",
    many: "cen"
  });
}

export function getTagCountWord(count: number): "etykietę" | "etykiety" | "etykiet" {
  return getPolishPlural(count, {
    one: "etykietę",
    few: "etykiety",
    many: "etykiet"
  });
}

export function getPrintableTagCountWord(count: number): "etykieta" | "etykiety" | "etykiet" {
  return getPolishPlural(count, {
    one: "etykieta",
    few: "etykiety",
    many: "etykiet"
  });
}

export function getPrintSheetCountWord(count: number): "arkusz" | "arkusze" | "arkuszy" {
  return getPolishPlural(count, {
    one: "arkusz",
    few: "arkusze",
    many: "arkuszy"
  });
}

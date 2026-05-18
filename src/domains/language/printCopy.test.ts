import { describe, expect, it } from "vitest";
import {
  getPrintableTagCountWord,
  getPriceCountWord,
  getPrintSheetCountWord,
  getTagCountWord
} from "./printCopy";

describe("printCopy", () => {
  it("uses Polish count forms for price labels", () => {
    expect(getPriceCountWord(0)).toBe("cen");
    expect(getPriceCountWord(1)).toBe("cena");
    expect(getPriceCountWord(2)).toBe("ceny");
    expect(getPriceCountWord(4)).toBe("ceny");
    expect(getPriceCountWord(5)).toBe("cen");
    expect(getPriceCountWord(11)).toBe("cen");
    expect(getPriceCountWord(21)).toBe("cen");
    expect(getPriceCountWord(22)).toBe("ceny");
    expect(getPriceCountWord(24)).toBe("ceny");
    expect(getPriceCountWord(25)).toBe("cen");
    expect(getPriceCountWord(31)).toBe("cen");
    expect(getPriceCountWord(32)).toBe("ceny");
    expect(getPriceCountWord(112)).toBe("cen");
    expect(getPriceCountWord(122)).toBe("ceny");
  });

  it("uses Polish count forms for tag labels", () => {
    expect(getTagCountWord(0)).toBe("etykiet");
    expect(getTagCountWord(1)).toBe("etykietę");
    expect(getTagCountWord(2)).toBe("etykiety");
    expect(getTagCountWord(5)).toBe("etykiet");
    expect(getTagCountWord(22)).toBe("etykiety");
    expect(getPrintableTagCountWord(0)).toBe("etykiet");
    expect(getPrintableTagCountWord(1)).toBe("etykieta");
    expect(getPrintableTagCountWord(2)).toBe("etykiety");
    expect(getPrintableTagCountWord(5)).toBe("etykiet");
    expect(getPrintableTagCountWord(22)).toBe("etykiety");
  });

  it("uses Polish count forms for sheet labels", () => {
    expect(getPrintSheetCountWord(1)).toBe("arkusz");
    expect(getPrintSheetCountWord(2)).toBe("arkusze");
    expect(getPrintSheetCountWord(5)).toBe("arkuszy");
    expect(getPrintSheetCountWord(22)).toBe("arkusze");
  });
});

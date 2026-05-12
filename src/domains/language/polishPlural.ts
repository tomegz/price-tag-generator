export type PolishCountForm = "one" | "few" | "many";

export type PolishPluralForms<TWord extends string = string> = Record<PolishCountForm, TWord>;

export function getPolishCountForm(count: number): PolishCountForm {
  const normalizedCount = Math.abs(Math.trunc(count));
  const mod10 = normalizedCount % 10;
  const mod100 = normalizedCount % 100;
  if (normalizedCount === 1) return "one";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
  return "many";
}

export function getPolishPlural<TWord extends string>(count: number, forms: PolishPluralForms<TWord>): TWord {
  if (!Number.isFinite(count)) return forms.many;
  return forms[getPolishCountForm(count)];
}

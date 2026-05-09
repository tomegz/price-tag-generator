export function getCurrentYear(): number {
  return new Date().getFullYear();
}

function getAvailableYears(): number[] {
  const currentYear = getCurrentYear();
  return [
    currentYear - 3,
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1
  ];
}

export const availableYearOptions: Array<string | number> = ['-', ...getAvailableYears()];

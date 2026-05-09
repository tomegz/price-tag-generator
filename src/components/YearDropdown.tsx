import type { ChangeEventHandler } from 'react';

import { availableYearOptions } from './yearOptions';

type YearDropdownProps = {
  value: string | number;
  onChange: ChangeEventHandler<HTMLSelectElement>;
};

const YearDropdown = ({ value, onChange }: YearDropdownProps) => (
  <select name="year" value={value} onChange={onChange}>
    {availableYearOptions.map(year => <option key={year} value={year}>{year}</option>)}
  </select>
);

export default YearDropdown;

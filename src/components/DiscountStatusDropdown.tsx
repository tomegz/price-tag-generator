import type { ChangeEventHandler } from 'react';

import {
  DiscountStatuses,
  type DiscountStatus
} from '../domains/catalog/catalog';

type DiscountStatusDropdownProps = {
  value: DiscountStatus;
  onChange: ChangeEventHandler<HTMLSelectElement>;
};

const DiscountStatusDropdown = ({ value, onChange }: DiscountStatusDropdownProps) => (
  <select name="discountStatus" value={value} onChange={onChange}>
    <option value={DiscountStatuses.ON}>Promocja włączona</option>
    <option value={DiscountStatuses.OFF}>Promocja wyłączona</option>
  </select>
);

export default DiscountStatusDropdown;

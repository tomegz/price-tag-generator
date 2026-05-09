import React from 'react';
import PropTypes from 'prop-types';

export const DiscountStatuses = {
  ON: 'on',
  OFF: 'off',
};

const DiscountStatusDropdown = ({ value, onChange }) => (
  <select name="discountStatus" value={value} onChange={onChange}>
    <option value={DiscountStatuses.ON}>Promocja włączona</option>
    <option value={DiscountStatuses.OFF}>Promocja wyłączona</option>
  </select>
);

DiscountStatusDropdown.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default DiscountStatusDropdown;

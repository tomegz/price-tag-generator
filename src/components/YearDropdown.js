import React from 'react';
import PropTypes from 'prop-types';

export const getCurrentYear = () => {
  return new Date().getFullYear();
};

const getAvailableYears = () => {
  const CURRENT_YEAR = getCurrentYear();
  return [
    CURRENT_YEAR - 3,
    CURRENT_YEAR - 2,
    CURRENT_YEAR -1,
    CURRENT_YEAR,
    CURRENT_YEAR + 1,
  ];
};

const AVAILABLE_YEARS = getAvailableYears();
const AVAILABLE_OPTIONS = ['-', ...AVAILABLE_YEARS];

const YearDropdown = ({ value, onChange }) => (
  <select name="year" value={value} onChange={onChange}>
    {AVAILABLE_OPTIONS.map(year => <option key={year} value={year}>{year}</option>)}
  </select>
);

YearDropdown.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default YearDropdown;

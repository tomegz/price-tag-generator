import "./components.css";

export type FilterPillOption = {
  label: string;
  value: string;
};

type FilterPillsProps = {
  ariaLabel: string;
  options: FilterPillOption[];
  value: string;
  onChange(value: string): void;
};

const FilterPills = ({ ariaLabel, options, value, onChange }: FilterPillsProps) => (
  <div aria-label={ariaLabel} className="ds-pills" role="group">
    {options.map(option => (
      <button
        aria-pressed={value === option.value}
        className="ds-pill"
        data-active={value === option.value ? "true" : "false"}
        key={option.value}
        onClick={() => onChange(option.value)}
        type="button"
      >
        {option.label}
      </button>
    ))}
  </div>
);

export default FilterPills;

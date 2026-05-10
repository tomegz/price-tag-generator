import "./components.css";

export type SegmentedOption<TValue extends string> = {
  label: string;
  value: TValue;
};

type SegmentedControlProps<TValue extends string> = {
  ariaLabel: string;
  options: SegmentedOption<TValue>[];
  value: TValue;
  onChange(value: TValue): void;
};

const SegmentedControl = <TValue extends string>({
  ariaLabel,
  options,
  value,
  onChange
}: SegmentedControlProps<TValue>) => (
  <div aria-label={ariaLabel} className="ds-segmented" role="group">
    {options.map(option => (
      <button
        aria-pressed={value === option.value}
        className="ds-segmented__button"
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

export default SegmentedControl;

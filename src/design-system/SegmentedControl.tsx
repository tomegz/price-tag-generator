import "./components.css";
import type { ReactNode } from "react";

export type SegmentedOption<TValue extends string> = {
  label: ReactNode;
  value: TValue;
  ariaLabel?: string;
};

type SegmentedControlProps<TValue extends string> = {
  ariaLabel: string;
  className?: string;
  options: SegmentedOption<TValue>[];
  value: TValue;
  onChange(value: TValue): void;
};

const SegmentedControl = <TValue extends string>({
  ariaLabel,
  className,
  options,
  value,
  onChange
}: SegmentedControlProps<TValue>) => (
  <div aria-label={ariaLabel} className={`ds-segmented${className ? ` ${className}` : ""}`} role="group">
    {options.map(option => (
      <button
        aria-label={option.ariaLabel}
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

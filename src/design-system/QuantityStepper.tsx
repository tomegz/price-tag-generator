import Icon from "./Icon";
import "./QuantityStepper.css";

type QuantityStepperProps = {
  ariaLabel: string;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  value: number;
  onChange(value: number): void;
};

const QuantityStepper = ({
  ariaLabel,
  min = 1,
  max = 99,
  onChange,
  size = "md",
  value
}: QuantityStepperProps) => {
  const nextValue = (delta: number) => {
    const next = Math.max(min, Math.min(max, value + delta));
    onChange(next);
  };

  return (
    <div aria-label={ariaLabel} className="ds-quantity" data-size={size} role="group">
      <button
        aria-label="Zmniejsz"
        className="ds-quantity__button"
        disabled={value <= min}
        onClick={() => nextValue(-1)}
        type="button"
      >
        <Icon name="minus" size={13} />
      </button>
      <span className="ds-quantity__value pb-mono">{value}</span>
      <button
        aria-label="Zwiększ"
        className="ds-quantity__button"
        disabled={value >= max}
        onClick={() => nextValue(1)}
        type="button"
      >
        <Icon name="plus" size={13} />
      </button>
    </div>
  );
};

export default QuantityStepper;

import type { InputHTMLAttributes } from "react";
import "./TextField.css";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  numeric?: boolean;
};

const TextField = ({ className = "", label, numeric = false, id, ...inputProps }: TextFieldProps) => {
  const input = (
    <input
      {...inputProps}
      className={`ds-input ${numeric ? "ds-input--numeric" : ""} ${className}`.trim()}
      id={id}
    />
  );

  if (!label) return input;

  return (
    <label className="ds-field" htmlFor={id}>
      <span className="ds-field__label">{label}</span>
      {input}
    </label>
  );
};

export default TextField;

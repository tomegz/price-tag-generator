import type { ButtonHTMLAttributes, ReactNode } from "react";
import Icon, { type IconName } from "./Icon";
import "./components.css";

type ButtonVariant = "primary" | "accent" | "ghost" | "darkGhost" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  icon?: IconName;
  variant?: ButtonVariant;
};

const Button = ({
  children,
  className = "",
  icon,
  type = "button",
  variant = "primary",
  ...buttonProps
}: ButtonProps) => (
  <button
    {...buttonProps}
    className={`ds-button ds-button--${variant} ${className}`.trim()}
    type={type}
  >
    {icon ? <Icon name={icon} size={14} /> : null}
    {children}
  </button>
);

export default Button;

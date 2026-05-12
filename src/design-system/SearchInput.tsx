import type { InputHTMLAttributes } from "react";
import Icon from "./Icon";
import "./components.css";

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

const SearchInput = ({ className = "", ...inputProps }: SearchInputProps) => (
  <div className={`ds-search ${className}`.trim()}>
    <Icon className="ds-search__icon" name="search" size={14} />
    <input {...inputProps} className="ds-search__input" type="search" />
  </div>
);

export default SearchInput;

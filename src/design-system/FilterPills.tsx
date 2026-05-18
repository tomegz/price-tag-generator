import { useCallback, useEffect, useRef, useState } from "react";
import "./FilterPills.css";

export type FilterPillOption = {
  label: string;
  value: string;
};

type FilterPillsProps = {
  ariaLabel: string;
  className?: string;
  grow?: boolean;
  mono?: boolean;
  options: FilterPillOption[];
  value: string;
  onChange(value: string): void;
};

const FilterPills = ({
  ariaLabel,
  className = "",
  grow = false,
  mono = false,
  options,
  value,
  onChange
}: FilterPillsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ left: false, right: false });

  const updateOverflow = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;

    const maxScrollLeft = node.scrollWidth - node.clientWidth;
    const next = {
      left: node.scrollLeft > 1,
      right: node.scrollLeft < maxScrollLeft - 1
    };

    setOverflow(current => (
      current.left === next.left && current.right === next.right ? current : next
    ));
  }, []);

  useEffect(() => {
    updateOverflow();

    const node = scrollRef.current;
    if (!node) return undefined;

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateOverflow);
    resizeObserver?.observe(node);
    window.addEventListener("resize", updateOverflow);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, [options, updateOverflow, value]);

  return (
    <div
      className={`ds-pills-frame${grow ? " ds-pills--grow" : ""}${className ? ` ${className}` : ""}`}
      data-overflow-left={overflow.left ? "true" : "false"}
      data-overflow-right={overflow.right ? "true" : "false"}
    >
      <div
        aria-label={ariaLabel}
        className="ds-pills"
        onScroll={updateOverflow}
        ref={scrollRef}
        role="group"
      >
        {options.map(option => (
          <button
            aria-pressed={value === option.value}
            className="ds-pill"
            data-active={value === option.value ? "true" : "false"}
            data-mono={mono && option.value !== "all" ? "true" : "false"}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterPills;

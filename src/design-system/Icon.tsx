import type { CSSProperties, ReactElement } from "react";

export type IconName =
  | "search"
  | "plus"
  | "minus"
  | "x"
  | "print"
  | "trash"
  | "pencil"
  | "check"
  | "tag"
  | "logout"
  | "percent"
  | "arrow-r"
  | "arrow-l"
  | "arrow-up"
  | "arrow-down"
  | "info"
  | "queue"
  | "bike";

type IconProps = {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
  style?: CSSProperties;
};

const paths: Record<IconName, ReactElement> = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  print: <><path d="M6 9V3h12v6" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="7" rx="1" /></>,
  trash: <><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" /></>,
  pencil: <><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></>,
  check: <path d="m4 12 5 5L20 6" />,
  tag: <><path d="M20 12 12 20l-9-9V3h8l9 9Z" /><circle cx="7.5" cy="7.5" r="1.2" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
  percent: <><path d="M19 5 5 19" /><circle cx="7" cy="7" r="2.5" /><circle cx="17" cy="17" r="2.5" /></>,
  "arrow-r": <path d="M5 12h14M13 5l7 7-7 7" />,
  "arrow-l": <path d="M19 12H5M11 5l-7 7 7 7" />,
  "arrow-up": <path d="M12 19V5M5 12l7-7 7 7" />,
  "arrow-down": <path d="M12 5v14M19 12l-7 7-7-7" />,
  info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-5M12 8h.01" /></>,
  queue: <><path d="M4 6h12M4 12h12M4 18h8" /><circle cx="20" cy="6" r="1.5" /><circle cx="20" cy="12" r="1.5" /></>,
  bike: <><circle cx="6" cy="17" r="4" /><circle cx="18" cy="17" r="4" /><path d="M6 17 10 7h5l3 10M10 7H7M15 7h2" /></>
};

const Icon = ({ name, size = 16, stroke = 1.6, className, style }: IconProps) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    height={size}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={stroke}
    style={style}
    viewBox="0 0 24 24"
    width={size}
  >
    {paths[name]}
  </svg>
);

export default Icon;

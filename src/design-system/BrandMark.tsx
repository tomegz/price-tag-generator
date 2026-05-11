type BrandMarkProps = {
  className?: string;
  size?: number;
};

const BrandMark = ({ className, size = 28 }: BrandMarkProps) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    height={size}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.6"
    viewBox="0 0 32 32"
    width={size}
  >
    <circle cx="16" cy="16" r="12.5" />
    <circle cx="16" cy="16" r="3.5" />
    <path d="M16 3.5v6M16 22.5v6M3.5 16h6M22.5 16h6M7.1 7.1l4.2 4.2M20.7 20.7l4.2 4.2M7.1 24.9l4.2-4.2M20.7 11.3l4.2-4.2" />
  </svg>
);

export default BrandMark;

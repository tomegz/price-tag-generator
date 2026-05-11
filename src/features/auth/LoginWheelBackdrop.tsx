type LoginWheelProps = {
  className: string;
  size: number;
  spokes: number;
  treads: number;
};

function pointOnWheel(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: 16 + Math.cos(radians) * radius,
    y: 16 + Math.sin(radians) * radius
  };
}

const wheelSpokes = (spokes: number) =>
  Array.from({ length: spokes }, (_, index) => {
    const angle = (index * 360) / spokes - 90;
    const start = pointOnWheel(angle, 3);
    const end = pointOnWheel(angle, 13.35);

    return <line key={angle} x1={start.x} x2={end.x} y1={start.y} y2={end.y} />;
  });

const wheelTreads = (treads: number) =>
  Array.from({ length: treads }, (_, index) => {
    const angle = (index * 360) / treads - 90;
    const center = pointOnWheel(angle, 14.5);
    const width = 0.84;
    const height = 0.92;

    return (
      <rect
        className="login-wheel__tread"
        key={angle}
        height={height}
        rx="0.16"
        transform={`rotate(${angle + 90} ${center.x} ${center.y})`}
        width={width}
        x={center.x - width / 2}
        y={center.y - height / 2}
      />
    );
  });

const LoginWheel = ({ className, size, spokes, treads }: LoginWheelProps) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    height={size}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 32 32"
    width={size}
  >
    <circle className="login-wheel__tire" cx="16" cy="16" r="14" />
    {wheelTreads(treads)}
    <circle className="login-wheel__rim" cx="16" cy="16" r="12.1" />
    <circle className="login-wheel__hub" cx="16" cy="16" r="3" />
    {wheelSpokes(spokes)}
  </svg>
);

const LoginWheelBackdrop = () => (
  <>
    <LoginWheel className="login-wheel login-wheel--large" size={720} spokes={12} treads={48} />
    <LoginWheel className="login-wheel login-wheel--small" size={520} spokes={8} treads={40} />
  </>
);

export default LoginWheelBackdrop;

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
};

const SIZES = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-4",
};

export default function Spinner({ size = "md", label, className = "" }: SpinnerProps) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className={`rounded-full border-gray-300 border-t-brand-green animate-spin ${SIZES[size]}`} />
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  );
}

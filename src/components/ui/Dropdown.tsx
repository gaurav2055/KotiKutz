type DropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  variant?: "dark" | "light";
};

export default function Dropdown({ value, onChange, options, placeholder, variant = "dark" }: DropdownProps) {
  const styles = {
    dark:  "bg-brand-dark border-brand-green text-brand-green",
    light: "bg-white border-gray-400 text-black",
  };

  const arrowColor = variant === "dark" ? "text-brand-green" : "text-black";

  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-12 border rounded px-3 pr-8 text-sm appearance-none cursor-pointer ${styles[variant]}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs ${arrowColor}`}>▾</div>
    </div>
  );
}

type DarkInputProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
};

export default function DarkInput({ placeholder, value, onChange, type = "text" }: DarkInputProps) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 bg-[#1c1c1c] border border-[#333] rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-brand-green transition-colors"
    />
  );
}

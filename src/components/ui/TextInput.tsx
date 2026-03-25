type TextInputProps = {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  readOnly?: boolean;
};

export default function TextInput({ label, value, onChange, type = "text", readOnly }: TextInputProps) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full h-10 border border-gray-300 rounded px-3 text-sm text-black outline-none focus:border-brand-green transition-colors"
      />
    </div>
  );
}

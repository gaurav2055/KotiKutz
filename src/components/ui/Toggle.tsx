type ToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export default function Toggle({ value, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
        value ? "bg-brand-green" : "bg-gray-300"
      }`}
    >
      <div
        className={`absolute top-[2px] w-[28px] h-[28px] bg-white rounded-full shadow transition-transform duration-200 ${
          value ? "translate-x-[22px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

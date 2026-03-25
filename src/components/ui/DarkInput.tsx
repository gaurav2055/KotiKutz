"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type DarkInputProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  label?: string;
  name?: string;
  autoComplete?: string;
};

export default function DarkInput({ placeholder, value, onChange, type = "text", label, name, autoComplete }: DarkInputProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={name} className="text-xs text-gray-400 px-1">{label}</label>
      )}
      <div className="relative">
        <input
          id={name}
          name={name}
          autoComplete={autoComplete}
          type={isPassword ? (visible ? "text" : "password") : type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 bg-[#1c1c1c] border border-[#333] rounded-xl px-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-brand-green transition-colors pr-10"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

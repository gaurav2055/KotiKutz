"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type Option = { label: string; value: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  variant?: "dark" | "light";
};

export default function AdminSelect({
  value,
  onChange,
  options,
  placeholder = "All",
  className = "",
  variant = "dark",
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const label = selected ? selected.label : placeholder;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasWidthClass = /\bw-/.test(className);

  const isDark = variant === "dark";

  const buttonClass = isDark
    ? "bg-white/5 border border-white/10 text-white hover:bg-white/10"
    : "bg-white border border-gray-300 text-black hover:bg-gray-50";

  const panelClass = isDark
    ? "bg-[#1e1e1e] border border-white/10"
    : "bg-white border border-gray-200 shadow-lg";

  const activeItemClass = isDark ? "text-white bg-white/10" : "text-black bg-gray-100";
  const inactiveItemClass = isDark
    ? "text-white/60 hover:bg-white/5 hover:text-white"
    : "text-gray-600 hover:bg-gray-50 hover:text-black";
  const placeholderClass = isDark ? "text-white/40" : "text-gray-400";

  return (
    <div ref={ref} className={`relative ${hasWidthClass ? "" : "w-fit"} ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-2 text-sm rounded-lg px-3 py-2 outline-none transition-colors min-w-[140px] ${buttonClass}`}
      >
        <span className={`flex-1 text-left truncate ${!value ? placeholderClass : ""}`}>{label}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""} ${isDark ? "text-white/50" : "text-gray-400"}`} />
      </button>

      {open && (
        <div className={`absolute z-50 mt-1 min-w-full max-h-60 overflow-y-auto rounded-lg overflow-hidden ${panelClass}`}>
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${!value ? activeItemClass : inactiveItemClass}`}
          >
            {placeholder}
          </button>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${value === o.value ? activeItemClass : inactiveItemClass}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

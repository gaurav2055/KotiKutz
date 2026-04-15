"use client";

import { useEffect } from "react";

type ModalProps = {
  onClose:     () => void;
  theme?:      "dark" | "light";
  width?:      string;
  scrollable?: boolean;
  children:    React.ReactNode;
};

const THEME = {
  dark:  { backdrop: "bg-black/70", panel: "bg-[#111] rounded-[14px] shadow-2xl" },
  light: { backdrop: "bg-black/40", panel: "bg-white rounded-[10px] shadow-xl"   },
};

export default function Modal({
  onClose,
  theme      = "dark",
  width      = "w-[480px]",
  scrollable = true,
  children,
}: ModalProps) {
  const t = THEME[theme];

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div className={`fixed inset-0 ${t.backdrop} z-40`} onClick={onClose} />

      {/* Centering shell — pointer-events-none so clicks fall through to backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`${t.panel} ${width} max-w-full p-6 md:p-8 pointer-events-auto overscroll-contain ${
            scrollable ? "max-h-[90vh] overflow-y-auto" : ""
          }`}
        >
          {children}
        </div>
      </div>
    </>
  );
}

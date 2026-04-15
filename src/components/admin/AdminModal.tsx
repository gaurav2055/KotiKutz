"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
};

const WIDTHS = { sm: "sm:max-w-sm", md: "sm:max-w-md", lg: "sm:max-w-lg" };

export default function AdminModal({ title, onClose, children, footer, maxWidth = "md" }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/*
        Mobile:  full-width bottom sheet, rounded top corners
        sm+:     centered dialog, all corners rounded, capped by maxWidth
        Always:  max-h-[90vh] — body scrolls, header+footer stay pinned
      */}
      <div
        className={`bg-[#1a1a1a] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full ${WIDTHS[maxWidth]} flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-white font-semibold text-base">{title}</h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white transition-colors -mr-1">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto overscroll-contain flex-1 px-6 py-5 space-y-4">
          {children}
        </div>

        {/* Pinned footer */}
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-white/10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

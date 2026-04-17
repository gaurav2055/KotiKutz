"use client";

import { Menu } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

const ROLE_LABELS: Record<string, string> = {
  employee: "Employee",
  manager: "Manager",
  super_admin: "Super Admin",
};

interface AdminTopbarProps {
  title: string;
  onMenuClick?: () => void;
}

export default function AdminTopbar({ title, onMenuClick }: AdminTopbarProps) {
  const { role, userName } = useAdmin();
  return (
    <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 text-white/60 hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-white font-semibold text-base">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {userName && (
          <span className="hidden sm:inline text-white/60 text-sm">{userName}</span>
        )}
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60 uppercase tracking-wide">
          {ROLE_LABELS[role] ?? role}
        </span>
      </div>
    </header>
  );
}

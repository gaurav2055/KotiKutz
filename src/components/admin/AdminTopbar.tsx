"use client";

interface AdminTopbarProps {
  title: string;
  role: string;
  userName?: string;
}

const ROLE_LABELS: Record<string, string> = {
  employee: "Employee",
  manager: "Manager",
  super_admin: "Super Admin",
};

export default function AdminTopbar({ title, role, userName }: AdminTopbarProps) {
  return (
    <header className="h-14 border-b border-white/10 flex items-center justify-between px-6">
      <h1 className="text-white font-semibold text-base">{title}</h1>
      <div className="flex items-center gap-3">
        {userName && (
          <span className="text-white/60 text-sm">{userName}</span>
        )}
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60 uppercase tracking-wide">
          {ROLE_LABELS[role] ?? role}
        </span>
      </div>
    </header>
  );
}

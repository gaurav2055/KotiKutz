"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  XCircle,
  LayoutDashboard,
  Scissors,
  Tag,
  GitPullRequest,
  Users,
  MapPin,
  FileText,
  UserCircle,
  MessageSquare,
  LogOut,
  Globe,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type AdminRole = "employee" | "manager" | "super_admin";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: AdminRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",            href: "/admin/dashboard",             icon: <LayoutDashboard size={18} />, roles: ["manager", "super_admin"] },
  { label: "Appointments",         href: "/admin/appointments",          icon: <CalendarDays size={18} />,    roles: ["employee", "manager", "super_admin"] },
  { label: "Cancellation Requests",href: "/admin/cancellation-requests", icon: <XCircle size={18} />,         roles: ["manager", "super_admin"] },
  { label: "Services",             href: "/admin/services",              icon: <Scissors size={18} />,        roles: ["manager", "super_admin"] },
  { label: "Offers",               href: "/admin/offers",                icon: <Tag size={18} />,             roles: ["manager", "super_admin"] },
  { label: "Change Requests",      href: "/admin/change-requests",       icon: <GitPullRequest size={18} />,  roles: ["super_admin"] },
  { label: "Staff",                href: "/admin/staff",                 icon: <Users size={18} />,           roles: ["super_admin"] },
  { label: "Locations",            href: "/admin/locations",             icon: <MapPin size={18} />,          roles: ["super_admin"] },
  { label: "Site Content",         href: "/admin/content",               icon: <FileText size={18} />,        roles: ["super_admin"] },
  { label: "Customers",            href: "/admin/customers",             icon: <UserCircle size={18} />,      roles: ["super_admin"] },
  { label: "Testimonials",         href: "/admin/testimonials",          icon: <MessageSquare size={18} />,   roles: ["super_admin"] },
];

export default function AdminSidebar({ role }: { role: AdminRole }) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-60 min-h-screen bg-[#0a0a0a] border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <span className="text-white font-bold text-lg tracking-wide">KotiKutz</span>
        <span className="ml-2 text-xs text-white/40 uppercase tracking-widest">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Client view + My Profile + Logout */}
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Globe size={18} />
          Client View
        </Link>
        <Link
          href="/admin/profile"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === "/admin/profile"
              ? "bg-white/10 text-white"
              : "text-white/50 hover:text-white hover:bg-white/5"
          }`}
        >
          <UserCircle size={18} />
          My Profile
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

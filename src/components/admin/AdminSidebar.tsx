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
  Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin, type AdminRole } from "@/contexts/AdminContext";
import { useEffect } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: AdminRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",             href: "/admin/dashboard",             icon: <LayoutDashboard size={18} />, roles: ["manager", "super_admin"] },
  { label: "Location Settings",     href: "/admin/location-settings",     icon: <Settings size={18} />,        roles: ["manager"] },
  { label: "Appointments",          href: "/admin/appointments",          icon: <CalendarDays size={18} />,    roles: ["employee", "manager", "super_admin"] },
  { label: "Cancellation Requests", href: "/admin/cancellation-requests", icon: <XCircle size={18} />,         roles: ["manager", "super_admin"] },
  { label: "Services",              href: "/admin/services",              icon: <Scissors size={18} />,        roles: ["manager", "super_admin"] },
  { label: "Offers",                href: "/admin/offers",                icon: <Tag size={18} />,             roles: ["manager", "super_admin"] },
  { label: "Change Requests",       href: "/admin/change-requests",       icon: <GitPullRequest size={18} />,  roles: ["super_admin"] },
  { label: "Staff",                 href: "/admin/staff",                 icon: <Users size={18} />,           roles: ["super_admin"] },
  { label: "Locations",             href: "/admin/locations",             icon: <MapPin size={18} />,          roles: ["super_admin"] },
  { label: "Site Content",          href: "/admin/content",               icon: <FileText size={18} />,        roles: ["super_admin"] },
  { label: "Customers",             href: "/admin/customers",             icon: <UserCircle size={18} />,      roles: ["super_admin"] },
  { label: "Testimonials",          href: "/admin/testimonials",          icon: <MessageSquare size={18} />,   roles: ["super_admin"] },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

function SidebarContent({ pathname, onClose, signOut }: { pathname: string; onClose: () => void; signOut: () => void }) {
  const { role } = useAdmin();
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));
  return (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <span className="text-white font-bold text-lg tracking-wide">KotiKutz</span>
        <span className="ml-2 text-xs text-white/40 uppercase tracking-widest">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
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
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Globe size={18} />
          Client View
        </Link>
        <Link
          href="/admin/profile"
          onClick={onClose}
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
          onClick={() => { signOut(); onClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  // Close sidebar on route change (mobile)
  useEffect(() => { onClose(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Backdrop — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 flex flex-col bg-[#0a0a0a] border-r border-white/10
          transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto lg:min-h-screen
        `}
      >
        <SidebarContent pathname={pathname} onClose={onClose} signOut={signOut} />
      </aside>
    </>
  );
}

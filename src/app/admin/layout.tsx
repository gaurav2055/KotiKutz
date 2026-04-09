"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import Spinner from "@/components/ui/Spinner";

type AdminRole = "employee" | "manager" | "super_admin";

// Page titles derived from pathname
function getTitle(pathname: string): string {
  const map: Record<string, string> = {
    "/admin/dashboard":             "Dashboard",
    "/admin/appointments":          "Appointments",
    "/admin/cancellation-requests": "Cancellation Requests",
    "/admin/services":              "Services",
    "/admin/offers":                "Offers",
    "/admin/change-requests":       "Change Requests",
    "/admin/staff":                 "Staff",
    "/admin/locations":             "Locations",
    "/admin/content":               "Site Content",
    "/admin/customers":             "Customers",
    "/admin/testimonials":          "Testimonials",
    "/admin/profile":               "My Profile",
  };
  return map[pathname] ?? "Admin";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<AdminRole | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/"); return; }

    supabase
      .from("profiles")
      .select("role, name, first_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        const r = data?.role;
        if (!r || r === "customer" || !["employee", "manager", "super_admin"].includes(r)) { router.replace("/"); return; }
        setRole(r as AdminRole);
        setUserName(data?.first_name || data?.name || "");
      });
  }, [user, loading, router]);

  if (loading || !role) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] text-white flex">
      <AdminSidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar title={getTitle(pathname)} role={role} userName={userName} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

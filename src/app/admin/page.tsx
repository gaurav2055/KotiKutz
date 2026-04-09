"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function AdminRoot() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        const role = data?.role;
        if (role === "employee") {
          router.replace("/admin/appointments");
        } else {
          router.replace("/admin/dashboard");
        }
      });
  }, [user, loading, router]);

  return null;
}

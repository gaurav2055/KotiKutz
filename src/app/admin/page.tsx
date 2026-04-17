"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminRoot() {
  const { role } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (role === "employee") {
      router.replace("/admin/appointments");
    } else {
      router.replace("/admin/dashboard");
    }
  }, [role, router]);

  return null;
}

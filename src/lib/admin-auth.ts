import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "./supabase-admin";

export type AdminRole = "employee" | "manager" | "super_admin";

export interface AdminCaller {
  userId: string;
  role: AdminRole;
  locationId: string | null;
}

export async function getAdminCaller(): Promise<AdminCaller | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role, preferred_location_id")
    .eq("id", user.id)
    .single();

  if (!profile || !["employee", "manager", "super_admin"].includes(profile.role)) return null;

  return {
    userId: user.id,
    role: profile.role as AdminRole,
    locationId: profile.preferred_location_id ?? null,
  };
}

export function requireRole(caller: AdminCaller | null, minRole: AdminRole): boolean {
  if (!caller) return false;
  const order: AdminRole[] = ["employee", "manager", "super_admin"];
  return order.indexOf(caller.role) >= order.indexOf(minRole);
}

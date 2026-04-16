import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAdminCaller, requireRole } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  // Single customer booking history
  if (userId) {
    const { data, error } = await supabaseAdmin
      .from("appointments")
      .select(`
        id, appointment_date, time_slot, status, total_price,
        locations(name), staff(profiles!staff_id_fkey(name, first_name, last_name)), appointment_services(services(name))
      `)
      .eq("user_id", userId)
      .order("appointment_date", { ascending: false })
      .limit(20);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  // Customer list
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, name, first_name, last_name, email, phone, gender, preferred_location_id, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

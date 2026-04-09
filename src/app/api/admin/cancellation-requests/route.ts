import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAdminCaller, requireRole } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "manager")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let query = supabaseAdmin
    .from("appointments")
    .select(`
      id, appointment_date, time_slot, status, cancellation_reason, cancellation_requested_by,
      profiles!appointments_user_id_fkey(name, first_name, last_name, email),
      locations(id, name),
      appointment_services(services(name)),
      requester:profiles!appointments_cancellation_requested_by_fkey(name, first_name)
    `)
    .eq("cancellation_requested", true)
    .order("appointment_date", { ascending: true });

  if (caller!.role === "manager") {
    query = query.eq("location_id", caller!.locationId ?? "");
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// PATCH: approve (cancel) or reject (clear flag)
export async function PATCH(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "manager")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, action } = await request.json();
  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (action === "approve") {
    const { error } = await supabaseAdmin
      .from("appointments")
      .update({ status: "cancelled", cancellation_requested: false })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabaseAdmin
      .from("appointments")
      .update({ cancellation_requested: false, cancellation_reason: null, cancellation_requested_by: null })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

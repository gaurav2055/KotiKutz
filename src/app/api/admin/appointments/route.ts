import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAdminCaller, requireRole } from "@/lib/admin-auth";

// GET /api/admin/appointments
// Query params: locationId, date, status, page (default 1), limit (default 20)
export async function GET(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "employee") || !caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filterLocation = searchParams.get("locationId");
  const filterDate     = searchParams.get("date");
  const filterStatus   = searchParams.get("status");
  const page  = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from("appointments")
    .select(`
      id, appointment_date, time_slot, status, total_price, notes,
      cancellation_requested, cancellation_reason, cancellation_requested_by,
      profiles!appointments_user_id_fkey(name, first_name, last_name, email, phone),
      locations(id, name),
      staff(profiles!staff_id_fkey(name, first_name, last_name)),
      appointment_services(services(name))
    `, { count: "exact" })
    .order("appointment_date", { ascending: false })
    .order("time_slot", { ascending: false })
    .range(offset, offset + limit - 1);

  // Scope by location for employee/manager
  if (caller.role === "employee" || caller.role === "manager") {
    query = query.eq("location_id", caller.locationId ?? "");
  } else if (filterLocation) {
    query = query.eq("location_id", filterLocation);
  }

  if (filterDate)   query = query.eq("appointment_date", filterDate);
  if (filterStatus) query = query.eq("status", filterStatus);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, count });
}

// PATCH /api/admin/appointments
// Body: { id, action: "confirm" | "cancel" | "request_cancellation", reason? }
export async function PATCH(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "employee") || !caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, action, reason } = body;

  if (!id || !action) {
    return NextResponse.json({ error: "Missing id or action" }, { status: 400 });
  }

  // Fetch the appointment to verify location scope
  const { data: appt, error: fetchErr } = await supabaseAdmin
    .from("appointments")
    .select("location_id, status")
    .eq("id", id)
    .single();

  if (fetchErr || !appt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Employees and managers can only act on their location
  if ((caller.role === "employee" || caller.role === "manager") && appt.location_id !== caller.locationId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "request_cancellation") {
    // Employee requests cancellation
    const { error } = await supabaseAdmin
      .from("appointments")
      .update({
        cancellation_requested: true,
        cancellation_requested_by: caller.userId,
        cancellation_reason: reason ?? null,
      })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "complete" || action === "no_show") {
    const terminal = ["cancelled", "completed", "no_show"];
    if (terminal.includes(appt.status)) {
      return NextResponse.json({ error: "Cannot update this appointment" }, { status: 400 });
    }
    const { error } = await supabaseAdmin
      .from("appointments")
      .update({ status: action === "complete" ? "completed" : "no_show" })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "confirm") {
    if (caller.role === "employee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { error } = await supabaseAdmin
      .from("appointments")
      .update({ status: "confirmed" })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "cancel") {
    if (caller.role === "employee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { error } = await supabaseAdmin
      .from("appointments")
      .update({ status: "cancelled", cancellation_requested: false })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAdminCaller, requireRole } from "@/lib/admin-auth";

const SELECT = "id, name, auto_confirm, open_time, close_time, slot_duration_minutes, max_concurrent_bookings";

export async function GET() {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "manager") || !caller?.locationId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("locations")
    .select(SELECT)
    .eq("id", caller.locationId)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function PATCH(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "manager") || !caller?.locationId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.auto_confirm !== undefined) updates.auto_confirm = body.auto_confirm;
  if (body.open_time !== undefined) updates.open_time = body.open_time;
  if (body.close_time !== undefined) updates.close_time = body.close_time;
  if (body.slot_duration_minutes !== undefined) updates.slot_duration_minutes = body.slot_duration_minutes;
  if (body.max_concurrent_bookings !== undefined) updates.max_concurrent_bookings = body.max_concurrent_bookings;

  const { data, error } = await supabaseAdmin
    .from("locations")
    .update(updates)
    .eq("id", caller.locationId)
    .select(SELECT)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

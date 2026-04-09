import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAdminCaller, requireRole } from "@/lib/admin-auth";

export async function GET() {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "manager")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabaseAdmin
    .from("services")
    .select("*")
    .order("category")
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "manager")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Manager: create a change request instead of direct insert
  if (caller!.role === "manager") {
    const { error } = await supabaseAdmin.from("change_requests").insert({
      type: "service_add",
      payload: body,
      requested_by: caller!.userId,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ pending: true });
  }

  // Super admin: direct insert
  const { data, error } = await supabaseAdmin.from("services").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, ...updates } = await request.json();
  const { data, error } = await supabaseAdmin.from("services").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "manager")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();

  if (caller!.role === "manager") {
    const { error } = await supabaseAdmin.from("change_requests").insert({
      type: "service_delete",
      payload: { id },
      requested_by: caller!.userId,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ pending: true });
  }

  const { error } = await supabaseAdmin.from("services").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

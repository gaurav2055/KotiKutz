import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAdminCaller, requireRole } from "@/lib/admin-auth";

export async function GET() {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabaseAdmin
    .from("locations")
    .select("*")
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, ...updates } = await request.json();
  const { data, error } = await supabaseAdmin.from("locations").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

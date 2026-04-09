import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAdminCaller, requireRole } from "@/lib/admin-auth";

export async function GET() {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabaseAdmin.from("site_content").select("*").order("key");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// PATCH: update one or more keys
// Body: { updates: { key: string, value: string }[] }
export async function PATCH(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { updates } = await request.json();
  if (!Array.isArray(updates)) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("site_content")
    .upsert(updates.map((u: { key: string; value: string }) => ({
      key: u.key,
      value: u.value,
      updated_at: new Date().toISOString(),
    })));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

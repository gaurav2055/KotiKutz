import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAdminCaller, requireRole } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "pending";

  const { data, error } = await supabaseAdmin
    .from("change_requests")
    .select("*, requester:profiles!change_requests_requested_by_fkey(name, first_name)")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// PATCH: approve or reject a change request
export async function PATCH(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, action } = await request.json();
  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: req, error: fetchErr } = await supabaseAdmin
    .from("change_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !req) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "approve") {
    // Execute the change
    if (req.type === "service_add") {
      await supabaseAdmin.from("services").insert(req.payload);
    } else if (req.type === "service_delete") {
      await supabaseAdmin.from("services").delete().eq("id", req.payload.id);
    } else if (req.type === "offer_add") {
      await supabaseAdmin.from("offers").insert(req.payload);
    } else if (req.type === "offer_delete") {
      await supabaseAdmin.from("offers").delete().eq("id", req.payload.id);
    }
  }

  const { error } = await supabaseAdmin
    .from("change_requests")
    .update({ status: action === "approve" ? "approved" : "rejected", reviewed_by: caller!.userId, reviewed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

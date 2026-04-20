import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAdminCaller } from "@/lib/admin-auth";

export async function PATCH(req: NextRequest) {
  const caller = await getAdminCaller();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bio, specialization, location_id } = await req.json();

  const { error } = await supabaseAdmin
    .from("staff")
    .upsert({
      id:             caller.userId,
      bio:            bio ?? null,
      specialization: specialization ?? null,
      location_id:    location_id ?? null,
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

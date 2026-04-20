import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error: updateError } = await supabaseAdmin
    .from("appointments")
    .update({ user_id: user.id })
    .eq("booking_email", user.email)
    .or("user_id.is.null,user_id.eq.")
    .select("id");

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ claimed: data?.length ?? 0 });
}

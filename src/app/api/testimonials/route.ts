import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId, locationId, reviewerName, content, rating } = await req.json();

    if (!userId || !locationId || !content || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("testimonials")
      .insert({
        user_id:       userId,
        location_id:   locationId,
        reviewer_name: reviewerName,
        content,
        rating,
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

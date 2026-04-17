import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAdminCaller, requireRole } from "@/lib/admin-auth";
import { sendEmail, offerEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "super_admin") || !caller) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { offerId } = await request.json();
  if (!offerId) return Response.json({ error: "Missing offerId" }, { status: 400 });

  const { data: offer } = await supabaseAdmin
    .from("offers")
    .select("title, description, bullet_points")
    .eq("id", offerId)
    .single();

  if (!offer) return Response.json({ error: "Offer not found" }, { status: 404 });

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("email, first_name, notification_preferences")
    .not("email", "is", null);

  let sent = 0;
  const batch = profiles ?? [];

  for (let i = 0; i < batch.length; i += 50) {
    const chunk = batch.slice(i, i + 50);
    await Promise.all(
      chunk
        .filter((p) => {
          const prefs = p.notification_preferences as Record<string, boolean> | null;
          return prefs?.offers !== false;
        })
        .map(async (p) => {
          if (!p.email) return;
          const { subject, html } = offerEmail({
            name: p.first_name ?? "there",
            title: offer.title,
            description: offer.description ?? "",
            bulletPoints: offer.bullet_points ?? [],
          });
          await sendEmail(p.email, subject, html);
          sent++;
        })
    );
    if (i + 50 < batch.length) await new Promise((r) => setTimeout(r, 1000));
  }

  return Response.json({ sent });
}

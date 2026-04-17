import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, reminderEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split("T")[0];

  const { data: appointments } = await supabaseAdmin
    .from("appointments")
    .select(`
      appointment_date, time_slot,
      profiles!appointments_user_id_fkey(email, first_name, notification_preferences),
      locations(name),
      appointment_services(services(name))
    `)
    .eq("appointment_date", dateStr)
    .in("status", ["pending", "confirmed"]);

  let sent = 0;
  for (const appt of appointments ?? []) {
    const profile = Array.isArray(appt.profiles) ? appt.profiles[0] : appt.profiles;
    const prefs = { reminder: true, ...(profile?.notification_preferences as Record<string, boolean> ?? {}) };
    if (!profile?.email || !prefs.reminder) continue;

    const loc = Array.isArray(appt.locations) ? appt.locations[0] : appt.locations;
    const serviceNames = (appt.appointment_services as unknown as { services: { name: string } | null }[] ?? [])
      .map((s) => s.services?.name).filter(Boolean).join(", ");

    const { subject, html } = reminderEmail({
      name: profile.first_name ?? "there",
      date: appt.appointment_date,
      time: appt.time_slot,
      location: (loc as { name: string } | null)?.name ?? "",
      services: serviceNames,
    });
    await sendEmail(profile.email, subject, html);
    sent++;
  }

  return Response.json({ sent });
}

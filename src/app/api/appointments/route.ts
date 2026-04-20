import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserEmailAndPrefs, sendEmail, bookingConfirmationEmail } from "@/lib/email";

// Server-side client uses secret key — bypasses RLS for trusted writes
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId, email, locationId, date, timeSlot, staffId, services, totalPrice, notes } = await req.json();

    if (!userId || !locationId || !date || !timeSlot || !services?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // --- Availability check (prevents race conditions) ---

    // Fetch location settings and staff count in parallel
    const [{ data: location }, { count: staffCount }] = await Promise.all([
      supabaseAdmin
        .from("locations")
        .select("max_concurrent_bookings, auto_confirm")
        .eq("id", locationId)
        .single(),
      supabaseAdmin
        .from("staff")
        .select("*", { count: "exact", head: true })
        .eq("location_id", locationId),
    ]);

    // Effective capacity: min(staff at location, owner-set max)
    const effectiveCapacity = Math.min(
      staffCount ?? 1,
      location?.max_concurrent_bookings ?? 1
    );

    // Count active bookings for this slot
    const { count: slotBookings } = await supabaseAdmin
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("location_id", locationId)
      .eq("appointment_date", date)
      .eq("time_slot", timeSlot)
      .neq("status", "cancelled");

    if ((slotBookings ?? 0) >= effectiveCapacity) {
      return NextResponse.json(
        { error: "This time slot is fully booked. Please choose another." },
        { status: 409 }
      );
    }

    // If a specific stylist was chosen, ensure they're still free
    if (staffId) {
      const { count: staffConflict } = await supabaseAdmin
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("location_id", locationId)
        .eq("appointment_date", date)
        .eq("time_slot", timeSlot)
        .eq("staff_id", staffId)
        .neq("status", "cancelled");

      if ((staffConflict ?? 0) > 0) {
        return NextResponse.json(
          { error: "This stylist is no longer available for that slot. Please choose another." },
          { status: 409 }
        );
      }
    }

    // --- Insert appointment ---
    const { data: appointment, error: apptError } = await supabaseAdmin
      .from("appointments")
      .insert({
        user_id:          userId,
        booking_email:    email ?? null,
        location_id:      locationId,
        appointment_date: date,
        time_slot:        timeSlot,
        staff_id:         staffId ?? null,
        total_price:      totalPrice,
        notes:            notes ?? null,
        status:           location?.auto_confirm ? "confirmed" : "pending",
      })
      .select("id")
      .single();

    if (apptError) return NextResponse.json({ error: apptError.message }, { status: 500 });

    // Link services to the appointment
    const serviceRows = services.map((serviceId: string) => ({
      appointment_id: appointment.id,
      service_id:     serviceId,
    }));

    const { error: servicesError } = await supabaseAdmin
      .from("appointment_services")
      .insert(serviceRows);

    if (servicesError) return NextResponse.json({ error: servicesError.message }, { status: 500 });

    void (async () => {
      const [{ email, name, prefs }, { data: loc }, { data: svcs }] = await Promise.all([
        getUserEmailAndPrefs(userId),
        supabaseAdmin.from("locations").select("name").eq("id", locationId).single(),
        supabaseAdmin.from("services").select("name").in("id", services),
      ]);
      if (!email || !prefs.booking) return;
      const { subject, html } = bookingConfirmationEmail({
        name, date, time: timeSlot,
        location: loc?.name ?? "",
        services: svcs?.map((s) => s.name).join(", ") ?? "",
        price: `₹${totalPrice}`,
      });
      await sendEmail(email, subject, html);
    })();

    return NextResponse.json({ appointmentId: appointment.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the appointment exists and belongs to this user
    const { data: appointment, error: fetchError } = await supabaseAdmin
      .from("appointments")
      .select("id, user_id, status, location_id")
      .eq("id", id)
      .single();

    if (fetchError || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (appointment.status === "cancelled" || appointment.status === "completed") {
      return NextResponse.json({ error: "This appointment cannot be modified" }, { status: 409 });
    }

    // --- CANCEL ---
    if (action === "cancel") {
      const { error } = await supabaseAdmin
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    // --- RESCHEDULE ---
    if (action === "reschedule") {
      const { date, timeSlot, staffId, locationId } = body;

      if (!date || !timeSlot) {
        return NextResponse.json({ error: "Missing date or time slot" }, { status: 400 });
      }

      // Use the new locationId if provided, otherwise keep existing
      const targetLocationId = locationId ?? appointment.location_id;

      // Fetch location capacity settings and staff count in parallel
      const [{ data: location }, { count: staffCount }] = await Promise.all([
        supabaseAdmin
          .from("locations")
          .select("max_concurrent_bookings")
          .eq("id", targetLocationId)
          .single(),
        supabaseAdmin
          .from("staff")
          .select("*", { count: "exact", head: true })
          .eq("location_id", targetLocationId),
      ]);

      const effectiveCapacity = Math.min(
        staffCount ?? 1,
        location?.max_concurrent_bookings ?? 1
      );

      // Count bookings for the new slot — excluding this appointment
      const { count: slotBookings } = await supabaseAdmin
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("location_id", targetLocationId)
        .eq("appointment_date", date)
        .eq("time_slot", timeSlot)
        .neq("status", "cancelled")
        .neq("id", id);

      if ((slotBookings ?? 0) >= effectiveCapacity) {
        return NextResponse.json(
          { error: "This time slot is fully booked. Please choose another." },
          { status: 409 }
        );
      }

      // If a specific stylist is chosen, check they're free (excluding current appointment)
      if (staffId) {
        const { count: staffConflict } = await supabaseAdmin
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("location_id", targetLocationId)
          .eq("appointment_date", date)
          .eq("time_slot", timeSlot)
          .eq("staff_id", staffId)
          .neq("status", "cancelled")
          .neq("id", id);

        if ((staffConflict ?? 0) > 0) {
          return NextResponse.json(
            { error: "This stylist is not available for that slot. Please choose another." },
            { status: 409 }
          );
        }
      }

      const { error } = await supabaseAdmin
        .from("appointments")
        .update({
          location_id:      targetLocationId,
          appointment_date: date,
          time_slot:        timeSlot,
          staff_id:         staffId ?? null,
        })
        .eq("id", id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

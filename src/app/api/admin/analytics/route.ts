import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAdminCaller, requireRole } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "manager") || !caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filterLocation = searchParams.get("locationId");

  const locationId = caller.role === "super_admin"
    ? (filterLocation || null)
    : caller.locationId;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // All queries in parallel
  let apptQuery = supabaseAdmin
    .from("appointments")
    .select("id, appointment_date, total_price, status, location_id, appointment_services(services(name))", { count: "exact" })
    .gte("appointment_date", monthStart)
    .neq("status", "cancelled");

  let allMonthQuery = supabaseAdmin
    .from("appointments")
    .select("id, status", { count: "exact" })
    .gte("appointment_date", monthStart);

  let dailyQuery = supabaseAdmin
    .from("appointments")
    .select("appointment_date, status")
    .gte("appointment_date", thirtyDaysAgo);

  let staffQuery = supabaseAdmin
    .from("profiles")
    .select("id", { count: "exact" })
    .in("role", ["employee", "manager"]);

  if (locationId) {
    apptQuery     = apptQuery.eq("location_id", locationId);
    allMonthQuery = allMonthQuery.eq("location_id", locationId);
    dailyQuery    = dailyQuery.eq("location_id", locationId);
    staffQuery    = staffQuery.eq("preferred_location_id", locationId);
  }

  const [
    { data: monthAppts, count: totalBookings },
    { count: allMonthCount },
    { data: dailyData },
    { count: staffCount },
  ] = await Promise.all([apptQuery, allMonthQuery, dailyQuery, staffQuery]);

  // Revenue + avg booking value
  const revenue = (monthAppts ?? []).reduce((sum, a) => sum + (a.total_price ?? 0), 0);
  const avgBookingValue = totalBookings ? Math.round(revenue / totalBookings) : 0;

  // Cancel count + rate
  const cancelCount = (allMonthCount ?? 0) - (totalBookings ?? 0);
  const cancelRate = allMonthCount
    ? Math.round((cancelCount / allMonthCount) * 100)
    : 0;

  // Top services
  const serviceCounts: Record<string, number> = {};
  (monthAppts ?? []).forEach((a) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a.appointment_services ?? []).forEach((as: any) => {
      const name = as.services?.name;
      if (name) serviceCounts[name] = (serviceCounts[name] ?? 0) + 1;
    });
  });
  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Bookings per day (last 30 days)
  const dailyCounts: Record<string, number> = {};
  (dailyData ?? []).filter(a => a.status !== "cancelled").forEach((a) => {
    dailyCounts[a.appointment_date] = (dailyCounts[a.appointment_date] ?? 0) + 1;
  });

  // Location breakdown (super_admin only, when no location filter)
  let locationBreakdown: { name: string; bookings: number }[] = [];
  if (caller.role === "super_admin" && !locationId) {
    const locationCounts: Record<string, { name: string; count: number }> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (monthAppts ?? []).forEach((a: any) => {
      const locId = a.location_id;
      if (locId) locationCounts[locId] = { name: locId, count: (locationCounts[locId]?.count ?? 0) + 1 };
    });

    // Fetch location names
    const locIds = Object.keys(locationCounts);
    if (locIds.length > 0) {
      const { data: locs } = await supabaseAdmin.from("locations").select("id, name").in("id", locIds);
      locationBreakdown = (locs ?? [])
        .map((l) => ({ name: l.name, bookings: locationCounts[l.id]?.count ?? 0 }))
        .sort((a, b) => b.bookings - a.bookings);
    }
  }

  return NextResponse.json({
    totalBookings: totalBookings ?? 0,
    revenue,
    avgBookingValue,
    cancelCount,
    cancelRate,
    staffCount: staffCount ?? 0,
    topServices,
    dailyCounts,
    locationBreakdown,
  });
}

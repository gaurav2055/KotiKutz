import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAdminCaller, requireRole } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const caller = await getAdminCaller();
  if (!requireRole(caller, "manager")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filterLocation = searchParams.get("locationId");

  // Scope location
  const locationId = caller!.role === "super_admin"
    ? (filterLocation || null)
    : caller!.locationId;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // Build base queries
  let apptQuery = supabaseAdmin
    .from("appointments")
    .select("id, appointment_date, total_price, status, appointment_services(services(name))", { count: "exact" })
    .gte("appointment_date", monthStart)
    .neq("status", "cancelled");

  let dailyQuery = supabaseAdmin
    .from("appointments")
    .select("appointment_date, status")
    .gte("appointment_date", thirtyDaysAgo);

  if (locationId) {
    apptQuery = apptQuery.eq("location_id", locationId);
    dailyQuery = dailyQuery.eq("location_id", locationId);
  }

  const [{ data: monthAppts, count: totalBookings }, { data: dailyData }] = await Promise.all([
    apptQuery,
    dailyQuery,
  ]);

  // Revenue this month
  const revenue = (monthAppts ?? []).reduce((sum, a) => sum + (a.total_price ?? 0), 0);

  // Cancellation rate this month
  let cancelQuery = supabaseAdmin
    .from("appointments")
    .select("id", { count: "exact" })
    .gte("appointment_date", monthStart)
    .eq("status", "cancelled");
  if (locationId) cancelQuery = cancelQuery.eq("location_id", locationId);
  const { count: cancelCount } = await cancelQuery;

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

  return NextResponse.json({
    totalBookings: totalBookings ?? 0,
    revenue,
    cancelCount: cancelCount ?? 0,
    topServices,
    dailyCounts,
  });
}

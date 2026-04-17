"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { supabase } from "@/lib/supabase";
import { CalendarDays, IndianRupee, TrendingDown, Users, BarChart2, Receipt } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import AdminSelect from "@/components/ui/AdminSelect";

interface Analytics {
  totalBookings: number;
  revenue: number;
  avgBookingValue: number;
  cancelCount: number;
  cancelRate: number;
  staffCount: number;
  topServices: { name: string; count: number }[];
  dailyCounts: Record<string, number>;
  locationBreakdown: { name: string; bookings: number }[];
}

interface Location { id: string; name: string; }

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
            <Skeleton className="h-5 w-5 rounded bg-white/10" />
            <Skeleton className="h-7 w-24 bg-white/10" />
            <Skeleton className="h-4 w-32 bg-white/10" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <Skeleton className="h-5 w-40 mb-4 bg-white/10" />
          <Skeleton className="h-32 w-full bg-white/10" />
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <Skeleton className="h-5 w-40 mb-4 bg-white/10" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-32 bg-white/10" />
                <Skeleton className="h-4 w-16 bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { role } = useAdmin();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [filterLocation, setFilterLocation] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("locations").select("id, name").order("name").then(({ data }) => setLocations(data ?? []));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const params = new URLSearchParams();
    if (filterLocation) params.set("locationId", filterLocation);
    fetch(`/api/admin/analytics?${params}`)
      .then((r) => r.json())
      .then((d) => { setAnalytics(d); setLoading(false); });
  }, [filterLocation]);

  const last30Days = Object.entries(analytics?.dailyCounts ?? {})
    .sort(([a], [b]) => a.localeCompare(b));
  const maxCount = Math.max(...last30Days.map(([, c]) => c), 1);

  const statCards = [
    {
      label: "Bookings This Month",
      value: analytics?.totalBookings ?? 0,
      icon: <CalendarDays size={18} />,
      color: "text-blue-400",
    },
    {
      label: "Revenue This Month",
      value: `₹${(analytics?.revenue ?? 0).toLocaleString("en-IN")}`,
      icon: <IndianRupee size={18} />,
      color: "text-green-400",
    },
    {
      label: "Avg Booking Value",
      value: `₹${(analytics?.avgBookingValue ?? 0).toLocaleString("en-IN")}`,
      icon: <Receipt size={18} />,
      color: "text-emerald-400",
    },
    {
      label: "Cancellation Rate",
      value: `${analytics?.cancelRate ?? 0}%`,
      sub: `${analytics?.cancelCount ?? 0} cancelled`,
      icon: <TrendingDown size={18} />,
      color: analytics?.cancelRate && analytics.cancelRate > 20 ? "text-red-400" : "text-orange-400",
    },
    {
      label: "Active Staff",
      value: analytics?.staffCount ?? 0,
      icon: <Users size={18} />,
      color: "text-purple-400",
    },
    {
      label: "Unique Services Booked",
      value: analytics?.topServices.length ?? 0,
      icon: <BarChart2 size={18} />,
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Location filter (super_admin only) */}
      {role === "super_admin" && (
        <div>
          <AdminSelect
            value={filterLocation}
            onChange={setFilterLocation}
            options={locations.map((l) => ({ label: l.name, value: l.id }))}
            placeholder="All Locations"
          />
        </div>
      )}

      {loading ? <DashboardSkeleton /> : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((card) => (
              <div key={card.label} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className={`mb-3 ${card.color}`}>{card.icon}</div>
                <div className="text-2xl font-bold text-white">{card.value}</div>
                {"sub" in card && card.sub && <div className="text-white/30 text-xs mt-0.5">{card.sub}</div>}
                <div className="text-white/50 text-sm mt-1">{card.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bookings chart (last 30 days) */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4">Bookings — Last 30 Days</h2>
              {last30Days.length === 0 ? (
                <p className="text-white/40 text-sm">No data.</p>
              ) : (
                <div className="flex items-end gap-px h-32">
                  {last30Days.map(([date, count], i) => (
                    <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div
                        className="w-full bg-brand-green/60 hover:bg-brand-green rounded-sm transition-colors cursor-default"
                        style={{ height: `${(count / maxCount) * 100}%`, minHeight: "3px" }}
                      />
                      {/* Date label every 5 days */}
                      {i % 5 === 0 && (
                        <span className="text-white/25 text-[8px] absolute -bottom-4">{date.slice(5)}</span>
                      )}
                      {/* Tooltip */}
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {date.slice(5)}: {count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top services */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4">Top Services This Month</h2>
              {(analytics?.topServices ?? []).length === 0 ? (
                <p className="text-white/40 text-sm">No data.</p>
              ) : (
                <div className="space-y-3">
                  {(analytics?.topServices ?? []).map((s) => {
                    const max = analytics!.topServices[0].count;
                    return (
                      <div key={s.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white/80 text-sm">{s.name}</span>
                          <span className="text-white/40 text-xs">{s.count} bookings</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-green/70 rounded-full"
                            style={{ width: `${(s.count / max) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Location breakdown (super_admin, no filter) */}
          {role === "super_admin" && !filterLocation && (analytics?.locationBreakdown ?? []).length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4">Bookings by Location This Month</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 text-left">
                      <th className="pb-2 font-medium">Location</th>
                      <th className="pb-2 font-medium text-right">Bookings</th>
                      <th className="pb-2 font-medium text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics?.locationBreakdown ?? []).map((l) => (
                      <tr key={l.name} className="border-b border-white/5">
                        <td className="py-2 text-white/80">{l.name}</td>
                        <td className="py-2 text-right text-white/60">{l.bookings}</td>
                        <td className="py-2 text-right text-white/40">
                          {analytics!.totalBookings > 0
                            ? `${Math.round((l.bookings / analytics!.totalBookings) * 100)}%`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

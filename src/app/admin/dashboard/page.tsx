"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import Spinner from "@/components/ui/Spinner";
import { CalendarDays, DollarSign, TrendingDown, Scissors } from "lucide-react";

interface Analytics {
  totalBookings: number;
  revenue: number;
  cancelCount: number;
  topServices: { name: string; count: number }[];
  dailyCounts: Record<string, number>;
}

interface Location { id: string; name: string; }

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [filterLocation, setFilterLocation] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    supabase.from("profiles").select("role").eq("id", user.id).single().then(({ data }) => setRole(data?.role ?? ""));
    supabase.from("locations").select("id, name").order("name").then(({ data }) => setLocations(data ?? []));
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (filterLocation) params.set("locationId", filterLocation);
    fetch(`/api/admin/analytics?${params}`)
      .then((r) => r.json())
      .then((d) => { setAnalytics(d); setLoading(false); });
  }, [user, filterLocation]);

  if (authLoading || loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;

  const last30Days = Object.entries(analytics?.dailyCounts ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14);

  const maxCount = Math.max(...last30Days.map(([, c]) => c), 1);

  return (
    <div className="space-y-6">
      {/* Location filter (super_admin only) */}
      {role === "super_admin" && (
        <div className="flex items-center gap-3">
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none"
          >
            <option value="">All Locations</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Bookings This Month", value: analytics?.totalBookings ?? 0, icon: <CalendarDays size={20} />, color: "text-blue-400" },
          { label: "Revenue This Month", value: `₹${((analytics?.revenue ?? 0) / 100).toLocaleString()}`, icon: <DollarSign size={20} />, color: "text-green-400" },
          { label: "Cancellations", value: analytics?.cancelCount ?? 0, icon: <TrendingDown size={20} />, color: "text-red-400" },
          { label: "Top Services", value: analytics?.topServices.length ?? 0, icon: <Scissors size={20} />, color: "text-yellow-400" },
        ].map((card) => (
          <div key={card.label} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className={`mb-3 ${card.color}`}>{card.icon}</div>
            <div className="text-2xl font-bold text-white">{card.value}</div>
            <div className="text-white/50 text-sm mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings chart (last 14 days) */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Bookings — Last 14 Days</h2>
          {last30Days.length === 0 ? (
            <p className="text-white/40 text-sm">No data.</p>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {last30Days.map(([date, count]) => (
                <div key={date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-brand-green/70 rounded-sm"
                    style={{ height: `${(count / maxCount) * 100}%`, minHeight: "4px" }}
                    title={`${date}: ${count}`}
                  />
                  <span className="text-white/30 text-[9px] rotate-45 origin-left">{date.slice(5)}</span>
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
              {(analytics?.topServices ?? []).map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">{s.name}</span>
                  <span className="text-white/50 text-sm">{s.count} bookings</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

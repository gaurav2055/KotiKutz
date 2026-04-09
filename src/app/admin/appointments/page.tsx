"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

type AdminRole = "employee" | "manager" | "super_admin";

interface Appointment {
  id: string;
  appointment_date: string;
  time_slot: string;
  status: string;
  total_price: number | null;
  notes: string | null;
  cancellation_requested: boolean;
  cancellation_reason: string | null;
  profiles: { name: string | null; first_name: string | null; last_name: string | null; email: string | null } | null;
  locations: { id: string; name: string } | null;
  staff: { name: string } | null;
  appointment_services: { services: { name: string } | null }[];
}

interface Location { id: string; name: string; }

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-green-500/20 text-green-400",
  completed: "bg-blue-500/20 text-blue-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function AdminAppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AdminRole | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters
  const [filterLocation, setFilterLocation] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Cancellation request modal
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterLocation) params.set("locationId", filterLocation);
    if (filterDate)     params.set("date", filterDate);
    if (filterStatus)   params.set("status", filterStatus);
    const res = await fetch(`/api/admin/appointments?${params}`);
    const json = await res.json();
    setAppointments(json.data ?? []);
    setLoading(false);
  }, [filterLocation, filterDate, filterStatus]);

  useEffect(() => {
    if (authLoading || !user) return;
    supabase.from("profiles").select("role").eq("id", user.id).single().then(({ data }) => {
      setRole(data?.role as AdminRole);
    });
    supabase.from("locations").select("id, name").order("name").then(({ data }) => {
      setLocations(data ?? []);
    });
  }, [user, authLoading]);

  useEffect(() => {
    if (role) fetchAppointments();
  }, [role, fetchAppointments]);

  async function doAction(id: string, action: string, reason?: string) {
    setActionLoading(id + action);
    await fetch("/api/admin/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, reason }),
    });
    setActionLoading(null);
    setCancelTarget(null);
    setCancelReason("");
    fetchAppointments();
  }

  function customerName(a: Appointment) {
    if (a.profiles?.first_name) return `${a.profiles.first_name} ${a.profiles?.last_name ?? ""}`.trim();
    return a.profiles?.name ?? a.profiles?.email ?? "—";
  }

  function formatDate(d: string) {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  if (authLoading || !role) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {role === "super_admin" && (
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none"
          >
            <option value="">All Locations</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        )}
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none"
        >
          <option value="">All Statuses</option>
          {["pending", "confirmed", "completed", "cancelled"].map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
        <button
          onClick={fetchAppointments}
          className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center pt-20"><Spinner size="lg" /></div>
      ) : appointments.length === 0 ? (
        <p className="text-white/40 text-sm text-center pt-20">No appointments found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm text-white">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-left">
                <th className="px-4 py-3 font-medium">Date & Time</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Services</th>
                <th className="px-4 py-3 font-medium">Staff</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div>{formatDate(a.appointment_date)}</div>
                    <div className="text-white/40">{a.time_slot}</div>
                  </td>
                  <td className="px-4 py-3">{customerName(a)}</td>
                  <td className="px-4 py-3 text-white/70">{a.locations?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-white/70">
                    {a.appointment_services.map((s) => s.services?.name).filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-white/70">{a.staff?.name ?? "Any"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[a.status] ?? "bg-white/10 text-white/60"}`}>
                        {a.status}
                      </span>
                      {a.cancellation_requested && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
                          Cancel Requested
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Employee: request cancellation */}
                      {role === "employee" && a.status !== "cancelled" && a.status !== "completed" && !a.cancellation_requested && (
                        <button
                          onClick={() => { setCancelTarget(a.id); setCancelReason(""); }}
                          className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
                        >
                          Request Cancel
                        </button>
                      )}
                      {/* Manager+: confirm, cancel directly, approve/reject cancellation request */}
                      {(role === "manager" || role === "super_admin") && (
                        <>
                          {a.status === "pending" && (
                            <button
                              disabled={!!actionLoading}
                              onClick={() => doAction(a.id, "confirm")}
                              className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle size={12} /> Confirm
                            </button>
                          )}
                          {a.status !== "cancelled" && a.status !== "completed" && (
                            <button
                              disabled={!!actionLoading}
                              onClick={() => doAction(a.id, "cancel")}
                              className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-1"
                            >
                              <XCircle size={12} /> Cancel
                            </button>
                          )}
                          {a.cancellation_requested && (
                            <button
                              disabled={!!actionLoading}
                              onClick={() => doAction(a.id, "cancel")}
                              className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors flex items-center gap-1"
                            >
                              <AlertTriangle size={12} /> Approve Cancel
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cancellation request modal (employee) */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold text-lg mb-2">Request Cancellation</h2>
            <p className="text-white/50 text-sm mb-4">Provide a reason. A manager will review this request.</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!cancelReason.trim() || !!actionLoading}
                onClick={() => doAction(cancelTarget, "request_cancellation", cancelReason)}
                className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

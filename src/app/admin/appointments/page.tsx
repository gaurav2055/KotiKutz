"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import AdminSelect from "@/components/ui/AdminSelect";
import AdminTable, { type ColumnDef } from "@/components/admin/AdminTable";
import AdminModal from "@/components/admin/AdminModal";

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
  no_show:   "bg-gray-500/20 text-gray-400",
};

function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function appointmentStart(date: string, slot: string): Date {
  const [time, ampm] = slot.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  const [y, mo, d] = date.split("-").map(Number);
  return new Date(y, mo - 1, d, h, m);
}

function customerName(a: Appointment) {
  if (a.profiles?.first_name) return `${a.profiles.first_name} ${a.profiles?.last_name ?? ""}`.trim();
  return a.profiles?.name ?? a.profiles?.email ?? "—";
}

export default function AdminAppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AdminRole | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [filterLocation, setFilterLocation] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

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
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, reason }),
    });
    setActionLoading(null);
    setCancelTarget(null);
    setCancelReason("");
    fetchAppointments();
  }

  const columns: ColumnDef<Appointment>[] = [
    {
      label: "Date & Time",
      render: (a) => (
        <div>
          <div className="whitespace-nowrap">{formatDate(a.appointment_date)}</div>
          <div className="text-white/40">{a.time_slot}</div>
        </div>
      ),
    },
    { label: "Customer", render: (a) => customerName(a) },
    { label: "Location",  render: (a) => <span className="text-white/70">{a.locations?.name ?? "—"}</span> },
    {
      label: "Services",
      render: (a) => (
        <span className="text-white/70">
          {a.appointment_services.map((s) => s.services?.name).filter(Boolean).join(", ") || "—"}
        </span>
      ),
    },
    { label: "Staff",  render: (a) => <span className="text-white/70">{a.staff?.name ?? "Any"}</span> },
    {
      label: "Status",
      render: (a) => (
        <div className="flex flex-col gap-1">
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[a.status] ?? "bg-white/10 text-white/60"}`}>
            {a.status === "no_show" ? "Missed" : a.status}
          </span>
          {a.cancellation_requested && (
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
              Cancel Requested
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Actions",
      render: (a) => {
        const start     = appointmentStart(a.appointment_date, a.time_slot);
        const now       = new Date();
        const canDone   = now >= start;
        const canMissed = now >= new Date(start.getTime() + 30 * 60 * 1000);
        return (
          <div className="flex items-center gap-2 flex-wrap">
            {!["cancelled", "completed", "no_show"].includes(a.status) && (
              <>
                {canDone && (
                  <button disabled={!!actionLoading} onClick={() => doAction(a.id, "complete")}
                    className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                    Mark Done
                  </button>
                )}
                {canMissed && (
                  <button disabled={!!actionLoading} onClick={() => doAction(a.id, "no_show")}
                    className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors">
                    Missed
                  </button>
                )}
              </>
            )}
            {role === "employee" && a.status !== "cancelled" && a.status !== "completed" && !a.cancellation_requested && (
              <button onClick={() => { setCancelTarget(a.id); setCancelReason(""); }}
                className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors">
                Request Cancel
              </button>
            )}
            {(role === "manager" || role === "super_admin") && (
              <>
                {a.status === "pending" && (
                  <button disabled={!!actionLoading} onClick={() => doAction(a.id, "confirm")}
                    className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors flex items-center gap-1">
                    <CheckCircle size={12} /> Confirm
                  </button>
                )}
                {a.status !== "cancelled" && a.status !== "completed" && (
                  <button disabled={!!actionLoading} onClick={() => doAction(a.id, "cancel")}
                    className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-1">
                    <XCircle size={12} /> Cancel
                  </button>
                )}
                {a.cancellation_requested && (
                  <button disabled={!!actionLoading} onClick={() => doAction(a.id, "cancel")}
                    className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors flex items-center gap-1">
                    <AlertTriangle size={12} /> Approve Cancel
                  </button>
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];

  if (authLoading || !role) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        {role === "super_admin" && (
          <AdminSelect value={filterLocation} onChange={setFilterLocation}
            options={locations.map((l) => ({ label: l.name, value: l.id }))} placeholder="All Locations" />
        )}
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
          className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none [color-scheme:dark]" />
        <AdminSelect value={filterStatus} onChange={setFilterStatus}
          options={["pending", "confirmed", "completed", "cancelled", "no_show"].map((s) => ({ label: s.replace("_", "-"), value: s }))}
          placeholder="All Statuses" />
        <button onClick={fetchAppointments}
          className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-lg transition-colors">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center pt-20"><Spinner size="lg" /></div>
      ) : (
        <AdminTable
          columns={columns}
          rows={appointments}
          keyExtractor={(a) => a.id}
          emptyMessage="No appointments found."
        />
      )}

      {cancelTarget && (
        <AdminModal
          title="Request Cancellation"
          maxWidth="sm"
          onClose={() => setCancelTarget(null)}
          footer={
            <div className="flex gap-3 justify-end">
              <button onClick={() => setCancelTarget(null)} className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">
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
          }
        >
          <p className="text-white/50 text-sm">Provide a reason. A manager will review this request.</p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none resize-none"
          />
        </AdminModal>
      )}
    </div>
  );
}

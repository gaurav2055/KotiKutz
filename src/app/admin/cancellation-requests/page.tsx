"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

interface CancelRequest {
  id: string;
  appointment_date: string;
  time_slot: string;
  status: string;
  cancellation_reason: string | null;
  profiles: { name: string | null; first_name: string | null; email: string | null } | null;
  locations: { name: string } | null;
  appointment_services: { services: { name: string } | null }[];
  requester: { name: string | null; first_name: string | null } | null;
}

export default function CancellationRequestsPage() {
  const [requests, setRequests] = useState<CancelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/cancellation-requests");
    const json = await res.json();
    setRequests(json.data ?? []);
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  async function doAction(id: string, action: "approve" | "reject") {
    setActionLoading(id + action);
    await fetch("/api/admin/cancellation-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setActionLoading(null);
    fetchRequests();
  }

  function formatDate(d: string) {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;

  return (
    <div>
      {requests.length === 0 ? (
        <div className="flex flex-col items-center pt-20 text-white/40">
          <CheckCircle size={40} className="mb-3 text-green-500/40" />
          <p>No pending cancellation requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const customerName = r.profiles?.first_name || r.profiles?.name || r.profiles?.email || "—";
            const requesterName = r.requester?.first_name || r.requester?.name || "Employee";
            const services = r.appointment_services.map((s) => s.services?.name).filter(Boolean).join(", ");

            return (
              <div key={r.id} className="bg-white/5 border border-orange-500/30 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{customerName}</span>
                      <span className="text-white/40 text-sm">—</span>
                      <span className="text-white/60 text-sm">{r.locations?.name ?? "—"}</span>
                    </div>
                    <div className="text-white/50 text-sm">{formatDate(r.appointment_date)} at {r.time_slot}</div>
                    {services && <div className="text-white/50 text-sm">{services}</div>}
                    {r.cancellation_reason && (
                      <div className="mt-2 text-sm text-orange-300 bg-orange-500/10 rounded-lg px-3 py-2">
                        <span className="text-orange-400 font-medium">Reason:</span> {r.cancellation_reason}
                      </div>
                    )}
                    <div className="text-white/30 text-xs mt-1">Requested by {requesterName}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={!!actionLoading}
                      onClick={() => doAction(r.id, "approve")}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors"
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      disabled={!!actionLoading}
                      onClick={() => doAction(r.id, "reject")}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

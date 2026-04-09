"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

type ReqStatus = "pending" | "approved" | "rejected";

interface ChangeRequest {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  status: string;
  created_at: string;
  requester: { name: string | null; first_name: string | null } | null;
}

const TYPE_LABELS: Record<string, string> = {
  service_add: "Add Service",
  service_delete: "Delete Service",
  offer_add: "Add Offer",
  offer_delete: "Delete Offer",
};

const TABS: { key: ReqStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function ChangeRequestsPage() {
  const [tab, setTab] = useState<ReqStatus>("pending");
  const [items, setItems] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/change-requests?status=${tab}`);
    const json = await res.json();
    setItems(json.data ?? []);
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function doAction(id: string, action: "approve" | "reject") {
    setActionLoading(id + action);
    await fetch("/api/admin/change-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setActionLoading(null);
    fetchItems();
  }

  return (
    <div>
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit mb-6">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-white/15 text-white" : "text-white/40 hover:text-white"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center pt-20"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <p className="text-white/40 text-sm text-center pt-20">No {tab} requests.</p>
      ) : (
        <div className="space-y-3">
          {items.map((req) => (
            <div key={req.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">{TYPE_LABELS[req.type] ?? req.type}</span>
                    <span className="text-white/40 text-xs">
                      by {req.requester?.first_name || req.requester?.name || "Manager"} · {new Date(req.created_at).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  {/* Payload preview */}
                  <div className="text-white/60 text-sm bg-white/5 rounded-lg px-3 py-2 font-mono text-xs max-h-32 overflow-auto">
                    {JSON.stringify(req.payload, null, 2)}
                  </div>
                </div>
                {tab === "pending" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button disabled={!!actionLoading} onClick={() => doAction(req.id, "approve")}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors">
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button disabled={!!actionLoading} onClick={() => doAction(req.id, "reject")}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors">
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, RotateCcw, Star } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

type TestimonialStatus = "pending" | "approved" | "rejected";

interface Testimonial {
  id: number;
  reviewer_name: string | null;
  content: string;
  rating: number;
  created_at: string;
  status: string;
  locations: { name: string } | null;
}

const TABS: { key: TestimonialStatus; label: string }[] = [
  { key: "pending",  label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function TestimonialsAdminPage() {
  const [tab, setTab] = useState<TestimonialStatus>("pending");
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/testimonials?status=${tab}`);
    const json = await res.json();
    setItems(json.data ?? []);
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function doAction(id: number, action: string) {
    setActionLoading(id);
    await fetch("/api/admin/testimonials", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setActionLoading(null);
    fetchItems();
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? "bg-white/15 text-white" : "text-white/40 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center pt-20"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <p className="text-white/40 text-sm text-center pt-20">No {tab} testimonials.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-white font-medium">{item.reviewer_name ?? "Anonymous"}</div>
                  <div className="text-white/40 text-xs">{item.locations?.name ?? "—"}</div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-white/20"} />
                  ))}
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed flex-1">{item.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-white/30 text-xs">
                  {new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <div className="flex gap-2">
                  {tab === "pending" && (
                    <>
                      <button
                        disabled={actionLoading === item.id}
                        onClick={() => doAction(item.id, "approve")}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors"
                      >
                        <CheckCircle size={12} /> Approve
                      </button>
                      <button
                        disabled={actionLoading === item.id}
                        onClick={() => doAction(item.id, "reject")}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                      >
                        <XCircle size={12} /> Reject
                      </button>
                    </>
                  )}
                  {(tab === "approved" || tab === "rejected") && (
                    <button
                      disabled={actionLoading === item.id}
                      onClick={() => doAction(item.id, "restore")}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-white/10 text-white/60 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <RotateCcw size={12} /> Restore
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

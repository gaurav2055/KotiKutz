"use client";

import { useEffect, useState, useCallback } from "react";
import { Pencil } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

interface Location {
  id: string;
  name: string;
  address: string | null;
  open_time: string;
  close_time: string;
  slot_duration_minutes: number;
  max_concurrent_bookings: number;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Location | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ open_time: "", close_time: "", slot_duration_minutes: "", max_concurrent_bookings: "", address: "" });

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/locations");
    const json = await res.json();
    setLocations(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  function openEdit(l: Location) {
    setEditTarget(l);
    setForm({
      open_time: l.open_time,
      close_time: l.close_time,
      slot_duration_minutes: String(l.slot_duration_minutes),
      max_concurrent_bookings: String(l.max_concurrent_bookings),
      address: l.address ?? "",
    });
  }

  async function handleSave() {
    if (!editTarget) return;
    setSaving(true);
    await fetch("/api/admin/locations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editTarget.id,
        open_time: form.open_time,
        close_time: form.close_time,
        slot_duration_minutes: parseInt(form.slot_duration_minutes),
        max_concurrent_bookings: parseInt(form.max_concurrent_bookings),
        address: form.address || null,
      }),
    });
    setSaving(false);
    setEditTarget(null);
    fetchLocations();
  }

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((l) => (
          <div key={l.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-medium">{l.name}</h3>
                <p className="text-white/40 text-sm">{l.address ?? "No address"}</p>
              </div>
              <button onClick={() => openEdit(l)} className="p-1.5 text-white/40 hover:text-white transition-colors"><Pencil size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-white/40">Hours:</span> <span className="text-white/70">{l.open_time} – {l.close_time}</span></div>
              <div><span className="text-white/40">Slot:</span> <span className="text-white/70">{l.slot_duration_minutes} min</span></div>
              <div><span className="text-white/40">Max bookings:</span> <span className="text-white/70">{l.max_concurrent_bookings}</span></div>
            </div>
          </div>
        ))}
      </div>

      {editTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-white font-semibold text-lg">Edit {editTarget.name}</h2>
            {[
              { label: "Address", key: "address", type: "text" },
              { label: "Open Time", key: "open_time", type: "time" },
              { label: "Close Time", key: "close_time", type: "time" },
              { label: "Slot Duration (minutes)", key: "slot_duration_minutes", type: "number" },
              { label: "Max Concurrent Bookings", key: "max_concurrent_bookings", type: "number" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="text-white/60 text-sm block mb-1">{label}</label>
                <input type={type} value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none" />
              </div>
            ))}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditTarget(null)} className="px-4 py-2 text-sm text-white/60 hover:text-white">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-brand-green text-black rounded-lg hover:opacity-90 disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

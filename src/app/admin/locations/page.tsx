"use client";

import { useEffect, useState, useCallback } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import AdminModal from "@/components/admin/AdminModal";

interface Location {
  id: string;
  name: string;
  address: string | null;
  open_time: string;
  close_time: string;
  slot_duration_minutes: number;
  max_concurrent_bookings: number;
}

const EMPTY_FORM = {
  name: "",
  address: "",
  open_time: "09:00",
  close_time: "20:00",
  slot_duration_minutes: "30",
  max_concurrent_bookings: "2",
};

const FIELDS = [
  { label: "Location Name", key: "name",                    type: "text",   createOnly: true  },
  { label: "Address",       key: "address",                  type: "text",   createOnly: false },
  { label: "Open Time",     key: "open_time",                type: "time",   createOnly: false },
  { label: "Close Time",    key: "close_time",               type: "time",   createOnly: false },
  { label: "Slot Duration (minutes)",       key: "slot_duration_minutes",    type: "number", createOnly: false },
  { label: "Max Concurrent Bookings",       key: "max_concurrent_bookings",  type: "number", createOnly: false },
];

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Location | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/locations");
    const json = await res.json();
    setLocations(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(l: Location) {
    setEditTarget(l);
    setForm({
      name: l.name,
      address: l.address ?? "",
      open_time: l.open_time,
      close_time: l.close_time,
      slot_duration_minutes: String(l.slot_duration_minutes),
      max_concurrent_bookings: String(l.max_concurrent_bookings),
    });
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      address: form.address || null,
      open_time: form.open_time,
      close_time: form.close_time,
      slot_duration_minutes: parseInt(form.slot_duration_minutes),
      max_concurrent_bookings: parseInt(form.max_concurrent_bookings),
    };

    if (editTarget) {
      await fetch("/api/admin/locations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editTarget.id, ...payload }),
      });
    } else {
      await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, name: form.name }),
      });
    }

    setSaving(false);
    setShowForm(false);
    fetchLocations();
  }

  async function handleDelete(l: Location) {
    if (!confirm(`Delete "${l.name}"? This cannot be undone and may affect existing appointments and services.`)) return;
    await fetch("/api/admin/locations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: l.id }),
    });
    fetchLocations();
  }

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add Location
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((l) => (
          <div key={l.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-medium">{l.name}</h3>
                <p className="text-white/40 text-sm">{l.address ?? "No address"}</p>
              </div>
              <div className="flex gap-1">
                <button title="Edit location" onClick={() => openEdit(l)} className="p-1.5 text-white/40 hover:text-white transition-colors">
                  <Pencil size={16} />
                </button>
                <button title="Delete location" onClick={() => handleDelete(l)} className="p-1.5 text-red-400/60 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-white/40">Hours:</span> <span className="text-white/70">{l.open_time} – {l.close_time}</span></div>
              <div><span className="text-white/40">Slot:</span> <span className="text-white/70">{l.slot_duration_minutes} min</span></div>
              <div><span className="text-white/40">Max bookings:</span> <span className="text-white/70">{l.max_concurrent_bookings}</span></div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <AdminModal
          title={editTarget ? `Edit ${editTarget.name}` : "Add Location"}
          onClose={() => setShowForm(false)}
          footer={
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="px-4 py-2 text-sm bg-brand-green text-black rounded-lg hover:opacity-90 disabled:opacity-50">
                {saving ? "Saving…" : editTarget ? "Save" : "Add Location"}
              </button>
            </div>
          }
        >
          {FIELDS.filter((f) => !f.createOnly || !editTarget).map(({ label, key, type }) => (
            <div key={key}>
              <label className="text-white/60 text-sm block mb-1">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none [color-scheme:dark]"
              />
            </div>
          ))}
        </AdminModal>
      )}
    </div>
  );
}

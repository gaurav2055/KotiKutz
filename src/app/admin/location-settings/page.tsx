"use client";

import { useEffect, useState } from "react";
import Spinner from "@/components/ui/Spinner";
import Toggle from "@/components/ui/Toggle";

interface LocationSettings {
  id: string;
  name: string;
  auto_confirm: boolean;
  open_time: string;
  close_time: string;
  slot_duration_minutes: number;
  max_concurrent_bookings: number;
}

export default function LocationSettingsPage() {
  const [settings, setSettings] = useState<LocationSettings | null>(null);
  const [form, setForm] = useState({
    auto_confirm: false,
    open_time: "09:00",
    close_time: "20:00",
    slot_duration_minutes: "30",
    max_concurrent_bookings: "2",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/location-settings")
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) {
          setSettings(data);
          setForm({
            auto_confirm: data.auto_confirm,
            open_time: data.open_time,
            close_time: data.close_time,
            slot_duration_minutes: String(data.slot_duration_minutes),
            max_concurrent_bookings: String(data.max_concurrent_bookings),
          });
        }
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/location-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auto_confirm: form.auto_confirm,
        open_time: form.open_time,
        close_time: form.close_time,
        slot_duration_minutes: parseInt(form.slot_duration_minutes),
        max_concurrent_bookings: parseInt(form.max_concurrent_bookings),
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;
  if (!settings) return <p className="text-white/40 text-sm">No location assigned to your account.</p>;

  return (
    <div className="max-w-lg">
      <p className="text-white/40 text-sm mb-6">{settings.name}</p>

      <div className="space-y-6">
        {/* Auto-confirm */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Auto-confirm appointments</p>
              <p className="text-white/40 text-xs mt-0.5">
                New bookings are automatically confirmed instead of waiting for manual approval.
              </p>
            </div>
            <Toggle value={form.auto_confirm} onChange={(v) => setForm({ ...form, auto_confirm: v })} />
          </div>
        </div>

        {/* Hours */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <p className="text-white text-sm font-medium">Operating Hours</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-xs block mb-1">Open Time</label>
              <input
                type="time"
                value={form.open_time}
                onChange={(e) => setForm({ ...form, open_time: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-white/60 text-xs block mb-1">Close Time</label>
              <input
                type="time"
                value={form.close_time}
                onChange={(e) => setForm({ ...form, close_time: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Booking capacity */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <p className="text-white text-sm font-medium">Booking Capacity</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-xs block mb-1">Slot Duration (min)</label>
              <input
                type="number"
                min={5}
                value={form.slot_duration_minutes}
                onChange={(e) => setForm({ ...form, slot_duration_minutes: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-white/60 text-xs block mb-1">Max Concurrent Bookings</label>
              <input
                type="number"
                min={1}
                value={form.max_concurrent_bookings}
                onChange={(e) => setForm({ ...form, max_concurrent_bookings: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-brand-green text-black text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {saved && <span className="text-brand-green text-sm">Saved</span>}
        </div>
      </div>
    </div>
  );
}

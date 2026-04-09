"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, UserMinus } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { supabase } from "@/lib/supabase";

interface StaffMember {
  id: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string;
  preferred_location_id: string | null;
  locations: { name: string } | null;
}

interface Location { id: string; name: string; }

const ROLE_OPTIONS = ["employee", "manager", "super_admin"];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "employee", locationId: "" });
  const [error, setError] = useState("");

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/staff");
    const json = await res.json();
    setStaff(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStaff();
    supabase.from("locations").select("id, name").order("name").then(({ data }) => setLocations(data ?? []));
  }, [fetchStaff]);

  function openCreate() {
    setEditTarget(null);
    setForm({ email: "", name: "", role: "employee", locationId: locations[0]?.id ?? "" });
    setError("");
    setShowForm(true);
  }

  function openEdit(s: StaffMember) {
    setEditTarget(s);
    setForm({ email: s.email ?? "", name: s.name ?? "", role: s.role, locationId: s.preferred_location_id ?? "" });
    setError("");
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    if (editTarget) {
      const res = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: editTarget.id, role: form.role, locationId: form.locationId, name: form.name }),
      });
      if (!res.ok) { const j = await res.json(); setError(j.error); setSaving(false); return; }
    } else {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, name: form.name, role: form.role, locationId: form.locationId }),
      });
      if (!res.ok) { const j = await res.json(); setError(j.error); setSaving(false); return; }
    }
    setSaving(false);
    setShowForm(false);
    fetchStaff();
  }

  async function handleRemove(id: string) {
    await fetch("/api/admin/staff", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    fetchStaff();
  }

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add Staff Member
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm text-white">
          <thead>
            <tr className="border-b border-white/10 text-white/40 text-left">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3">{s.first_name ? `${s.first_name} ${s.last_name ?? ""}`.trim() : s.name ?? "—"}</td>
                <td className="px-4 py-3 text-white/60">{s.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                    s.role === "super_admin" ? "bg-purple-500/20 text-purple-400" :
                    s.role === "manager" ? "bg-blue-500/20 text-blue-400" :
                    "bg-white/10 text-white/60"
                  }`}>{s.role.replace("_", " ")}</span>
                </td>
                <td className="px-4 py-3 text-white/60">{s.locations?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-white/40 hover:text-white transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => handleRemove(s.id)} className="p-1.5 text-red-400/60 hover:text-red-400 transition-colors"><UserMinus size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-white font-semibold text-lg">{editTarget ? "Edit Staff Member" : "Add Staff Member"}</h2>
            {!editTarget && (
              <div>
                <label className="text-white/60 text-sm block mb-1">Email</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none [color-scheme:dark]" placeholder="staff@example.com" />
              </div>
            )}
            <div>
              <label className="text-white/60 text-sm block mb-1">Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none [color-scheme:dark]" placeholder="John Doe" />
            </div>
            <div>
              <label className="text-white/60 text-sm block mb-1">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none [color-scheme:dark]">
                {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/60 text-sm block mb-1">Location</label>
              <select value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none [color-scheme:dark]">
                <option value="">— Unassigned —</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {!editTarget && <p className="text-white/40 text-xs">A password reset email will be sent to the new staff member.</p>}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 text-sm bg-brand-green text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, UserMinus } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { supabase } from "@/lib/supabase";
import AdminTable, { type ColumnDef } from "@/components/admin/AdminTable";
import AdminModal from "@/components/admin/AdminModal";
import AdminSelect from "@/components/ui/AdminSelect";
import TableImage from "@/components/admin/TableImage";

interface StaffMember {
  id: string;
  name: string | null;
  bio: string | null;
  specialization: string | null;
  avatar_url: string | null;
  location_id: string | null;
  location_name: string | null;
  email: string | null;
  role: string;
  first_name: string | null;
  last_name: string | null;
}

interface Location { id: string; name: string; }

const ROLE_OPTIONS = ["employee", "manager", "super_admin"];

const ROLE_BADGE: Record<string, string> = {
  super_admin: "bg-purple-500/20 text-purple-400",
  manager:     "bg-blue-500/20 text-blue-400",
  employee:    "bg-white/10 text-white/60",
};

type AddMode = "create" | "link";

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [addMode, setAddMode] = useState<AddMode>("create");
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "", role: "employee", locationId: "" });

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
    setAddMode("create");
    setForm({ email: "", firstName: "", lastName: "", role: "employee", locationId: locations[0]?.id ?? "" });
    setError("");
    setShowForm(true);
  }

  function openEdit(s: StaffMember) {
    setEditTarget(s);
    setForm({ email: s.email ?? "", firstName: s.first_name ?? "", lastName: s.last_name ?? "", role: s.role, locationId: s.location_id ?? "" });
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
        body: JSON.stringify({ userId: editTarget.id, role: form.role, locationId: form.locationId, firstName: form.firstName, lastName: form.lastName }),
      });
      if (!res.ok) { const j = await res.json(); setError(j.error); setSaving(false); return; }
    } else {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          firstName: addMode === "create" ? form.firstName : undefined,
          lastName: addMode === "create" ? form.lastName : undefined,
          role: form.role,
          locationId: form.locationId,
          mode: addMode,
          redirectTo: `${window.location.origin}/auth/callback`,
        }),
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

  const columns: ColumnDef<StaffMember>[] = [
    {
      label: "",
      headerClassName: "w-12",
      mobileHero: true,
      render: (s) => s.avatar_url
        ? <TableImage src={s.avatar_url} alt={s.name ?? "Staff"} />
        : <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/30 text-xs shrink-0">
            {(s.name ?? s.email ?? "?")[0].toUpperCase()}
          </div>,
    },
    {
      label: "Name",
      render: (s) => {
        const display = s.first_name ? `${s.first_name} ${s.last_name ?? ""}`.trim() : s.name ?? "—";
        return (
          <div>
            <p>{display}</p>
            {s.specialization && <p className="text-white/40 text-xs mt-0.5">{s.specialization}</p>}
          </div>
        );
      },
    },
    { label: "Email",    render: (s) => <span className="text-white/60">{s.email ?? "—"}</span> },
    {
      label: "Role",
      render: (s) => (
        <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${ROLE_BADGE[s.role] ?? "bg-white/10 text-white/60"}`}>
          {s.role.replace("_", " ")}
        </span>
      ),
    },
    { label: "Location", render: (s) => <span className="text-white/60">{s.location_name ?? "—"}</span> },
    {
      label: "Actions",
      render: (s) => (
        <div className="flex gap-2">
          <button title="Edit staff member" onClick={() => openEdit(s)} className="p-1.5 text-white/40 hover:text-white transition-colors"><Pencil size={14} /></button>
          <button title="Remove staff member" onClick={() => handleRemove(s.id)} className="p-1.5 text-red-400/60 hover:text-red-400 transition-colors"><UserMinus size={14} /></button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
          <Plus size={16} /> Add Staff Member
        </button>
      </div>

      <AdminTable
        columns={columns}
        rows={staff}
        keyExtractor={(s) => s.id}
        emptyMessage="No staff members found."
      />

      {showForm && (
        <AdminModal
          title={editTarget ? "Edit Staff Member" : "Add Staff Member"}
          onClose={() => setShowForm(false)}
          footer={
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 text-sm bg-brand-green text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          }
        >
          {/* Mode toggle — only shown when creating */}
          {!editTarget && (
            <div className="flex bg-white/5 rounded-lg p-1 gap-1">
              {(["create", "link"] as AddMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setAddMode(m); setError(""); }}
                  className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${addMode === m ? "bg-brand-green text-black font-medium" : "text-white/50 hover:text-white"}`}
                >
                  {m === "create" ? "Create Account" : "Link Existing Account"}
                </button>
              ))}
            </div>
          )}

          <div>
            <label className="text-white/60 text-sm block mb-1">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none [color-scheme:dark]"
              placeholder="staff@example.com"
              readOnly={!!editTarget}
            />
          </div>

          {/* Name fields only for "create" mode or editing */}
          {(!editTarget && addMode === "create" || editTarget) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 text-sm block mb-1">First Name</label>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none [color-scheme:dark]"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1">Last Name</label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none [color-scheme:dark]"
                  placeholder="Doe"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-white/60 text-sm block mb-1">Role</label>
            <AdminSelect
              value={form.role}
              onChange={(v) => setForm({ ...form, role: v || "employee" })}
              options={ROLE_OPTIONS.map((r) => ({ label: r.replace("_", " "), value: r }))}
              placeholder="Select role"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm block mb-1">Location</label>
            <AdminSelect
              value={form.locationId}
              onChange={(v) => setForm({ ...form, locationId: v })}
              options={locations.map((l) => ({ label: l.name, value: l.id }))}
              placeholder="— Unassigned —"
              className="w-full"
              emptyIsValid
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {!editTarget && (
            <p className="text-white/30 text-xs">
              {addMode === "create"
                ? "A password reset email will be sent so the staff member can set their own password."
                : "The staff member must already have a KotiKutz account before being linked here."}
            </p>
          )}
        </AdminModal>
      )}
    </div>
  );
}

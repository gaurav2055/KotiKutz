"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

interface Service {
  id: string;
  name: string;
  category: string;
  gender: string;
  price: number;
  description: string | null;
}

const GENDERS = ["Male", "Female", "Unisex"];

export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingMsg, setPendingMsg] = useState("");
  const [form, setForm] = useState({ name: "", category: "", gender: "Unisex", price: "", description: "" });

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/services");
    const json = await res.json();
    setServices(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("role").eq("id", user.id).single().then(({ data }) => setRole(data?.role ?? ""));
    fetchServices();
  }, [user, fetchServices]);

  function openCreate() {
    setEditTarget(null);
    setForm({ name: "", category: "", gender: "Unisex", price: "", description: "" });
    setPendingMsg("");
    setShowForm(true);
  }

  function openEdit(s: Service) {
    setEditTarget(s);
    setForm({ name: s.name, category: s.category, gender: s.gender, price: String(s.price), description: s.description ?? "" });
    setPendingMsg("");
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = { name: form.name, category: form.category, gender: form.gender, price: parseInt(form.price), description: form.description || null };
    if (editTarget) {
      await fetch("/api/admin/services", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editTarget.id, ...payload }) });
      setShowForm(false);
      fetchServices();
    } else {
      const res = await fetch("/api/admin/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.pending) {
        setPendingMsg("Your request has been submitted for super admin approval.");
        fetchServices();
      } else {
        setShowForm(false);
        fetchServices();
      }
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch("/api/admin/services", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const json = await res.json();
    if (json.pending) {
      alert("Delete request submitted for super admin approval.");
    }
    fetchServices();
  }

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-brand-green text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
          <Plus size={16} /> {role === "manager" ? "Request New Service" : "Add Service"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm text-white">
          <thead>
            <tr className="border-b border-white/10 text-white/40 text-left">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Gender</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3 text-white/60">{s.category}</td>
                <td className="px-4 py-3 text-white/60">{s.gender}</td>
                <td className="px-4 py-3">₹{(s.price / 100).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {role === "super_admin" && <button onClick={() => openEdit(s)} className="p-1.5 text-white/40 hover:text-white transition-colors"><Pencil size={14} /></button>}
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-400/60 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-white font-semibold text-lg">{editTarget ? "Edit Service" : role === "manager" ? "Request New Service" : "Add Service"}</h2>
            {pendingMsg ? (
              <div className="space-y-4">
                <p className="text-green-400 text-sm">{pendingMsg}</p>
                <button onClick={() => setShowForm(false)} className="w-full px-4 py-2 text-sm bg-white/10 text-white rounded-lg">Close</button>
              </div>
            ) : (
              <>
                {[
                  { label: "Name", key: "name", placeholder: "e.g. Classic Haircut" },
                  { label: "Category", key: "category", placeholder: "e.g. Hair" },
                  { label: "Price (paise)", key: "price", placeholder: "e.g. 30000 for ₹300" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="text-white/60 text-sm block mb-1">{label}</label>
                    <input value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none" placeholder={placeholder} />
                  </div>
                ))}
                <div>
                  <label className="text-white/60 text-sm block mb-1">Gender</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none">
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none resize-none" />
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-brand-green text-black rounded-lg hover:opacity-90 disabled:opacity-50">
                    {saving ? "Saving…" : editTarget ? "Save" : role === "manager" ? "Submit Request" : "Add Service"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

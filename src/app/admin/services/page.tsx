"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useAdmin } from "@/contexts/AdminContext";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import AdminSelect from "@/components/ui/AdminSelect";
import AdminTable, { type ColumnDef } from "@/components/admin/AdminTable";
import AdminModal from "@/components/admin/AdminModal";
import TableImage from "@/components/admin/TableImage";

interface Service {
  id: string;
  name: string;
  category: string;
  gender: string;
  price: number;
  description: string | null;
  location_id: string | null;
  image_url: string | null;
}

type SortKey = "name" | "category" | "gender" | "price";

const GENDERS = ["Male", "Female", "Unisex"];

export default function ServicesPage() {
  const { role } = useAdmin();
  const [services, setServices] = useState<Service[]>([]);
  const [locations, setLocations] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingMsg, setPendingMsg] = useState("");
  const [form, setForm] = useState({ name: "", category: "", gender: "Unisex", price: "", description: "", location_id: "" });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/services");
    const json = await res.json();
    setServices(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServices();
    supabase.from("locations").select("id, name").then(({ data }) => {
      if (data) setLocations(data.map((l) => ({ label: l.name, value: l.id })));
    });
  }, [fetchServices]);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key as SortKey); setSortDir("asc"); }
  }

  const categories = [...new Set(services.map((s) => s.category))].sort();

  const displayed = [...services]
    .filter((s) =>
      (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase())) &&
      (!filterGender || s.gender === filterGender || s.gender === "Unisex") &&
      (!filterCategory || s.category === filterCategory) &&
      (!filterLocation || s.location_id === filterLocation || s.location_id === null)
    )
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = typeof av === "number" ? (av as number) - (bv as number) : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });

  function openCreate() {
    setEditTarget(null);
    setForm({ name: "", category: "", gender: "Unisex", price: "", description: "", location_id: "" });
    setImageFile(null);
    setImagePreview(null);
    setPendingMsg("");
    setShowForm(true);
  }

  function openEdit(s: Service) {
    setEditTarget(s);
    setForm({ name: s.name, category: s.category, gender: s.gender, price: String(s.price), description: s.description ?? "", location_id: s.location_id ?? "" });
    setImageFile(null);
    setImagePreview(s.image_url ?? null);
    setPendingMsg("");
    setShowForm(true);
  }

  async function uploadImage(serviceId: string, oldImageUrl: string | null): Promise<string | null> {
    if (!imageFile) return oldImageUrl;
    const prevPath = oldImageUrl
      ? oldImageUrl.split("/storage/v1/object/public/services/")[1] ?? null
      : null;
    const ext = imageFile.name.split(".").pop();
    const fd = new FormData();
    fd.append("file", imageFile);
    fd.append("bucket", "services");
    fd.append("path", `${serviceId}.${ext}`);
    if (prevPath) fd.append("prevPath", prevPath);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = await res.json();
    return json.url ?? oldImageUrl;
  }

  const canSubmit = !!(form.name && form.category && form.price && form.gender && (imageFile || imagePreview));

  async function handleSave() {
    if (!canSubmit) return;
    setSaving(true);
    const payload = {
      name: form.name, category: form.category, gender: form.gender,
      price: parseInt(form.price), description: form.description || null,
      location_id: form.location_id || null,
    };

    if (editTarget) {
      const imageUrl = await uploadImage(editTarget.id, editTarget.image_url);
      const res = await fetch("/api/admin/services", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editTarget.id, ...payload, image_url: imageUrl }),
      });
      const json = await res.json();
      if (json.pending) setPendingMsg("Your edit request has been submitted for super admin approval.");
      else { setShowForm(false); fetchServices(); }
    } else if (role === "manager") {
      const ext = imageFile!.name.split(".").pop();
      const fd = new FormData();
      fd.append("file", imageFile!);
      fd.append("bucket", "services");
      fd.append("path", `pending-${Date.now()}.${ext}`);
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const { url: imageUrl } = await uploadRes.json();
      const res = await fetch("/api/admin/services", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, image_url: imageUrl }),
      });
      const json = await res.json();
      if (json.pending) setPendingMsg("Your request has been submitted for super admin approval.");
      else { setShowForm(false); fetchServices(); }
    } else {
      const res = await fetch("/api/admin/services", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.data?.id) {
        const imageUrl = await uploadImage(json.data.id, null);
        if (imageUrl) {
          await fetch("/api/admin/services", {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: json.data.id, image_url: imageUrl }),
          });
        }
      }
      setShowForm(false);
      fetchServices();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch("/api/admin/services", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const json = await res.json();
    if (json.pending) alert("Delete request submitted for super admin approval.");
    fetchServices();
  }

  const columns: ColumnDef<Service>[] = [
    {
      label: "",
      headerClassName: "w-12",
      mobileHero: true,
      render: (s) => s.image_url
        ? <TableImage src={s.image_url} alt={s.name} />
        : <div className="w-9 h-9 rounded-md bg-white/5 flex items-center justify-center text-white/20 text-xs">?</div>,
    },
    { label: "Name",     sortKey: "name",     render: (s) => s.name },
    { label: "Category", sortKey: "category", render: (s) => <span className="text-white/60">{s.category}</span> },
    { label: "Gender",   sortKey: "gender",   render: (s) => <span className="text-white/60">{s.gender}</span> },
    { label: "Price",    sortKey: "price",    render: (s) => `₹${s.price.toLocaleString()}` },
    {
      label: "Location",
      render: (s) => <span className="text-white/60">{s.location_id ? (locations.find((l) => l.value === s.location_id)?.label ?? "—") : "All"}</span>,
    },
    {
      label: "Actions",
      render: (s) => (
        <div className="flex gap-2">
          <button title="Edit service" onClick={() => openEdit(s)} className="p-1.5 text-white/40 hover:text-white transition-colors"><Pencil size={14} /></button>
          <button title="Delete service" onClick={() => handleDelete(s.id)} className="p-1.5 text-red-400/60 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  const modalTitle = pendingMsg
    ? "Request Submitted"
    : editTarget
      ? role === "manager" ? "Request Service Edit" : "Edit Service"
      : role === "manager" ? "Request New Service" : "Add Service";

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-brand-green text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
          <Plus size={16} /> {role === "manager" ? "Request New Service" : "Add Service"}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Search services…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none flex-1 min-w-[160px]"
        />
        <AdminSelect value={filterCategory} onChange={setFilterCategory}
          options={categories.map((c) => ({ label: c, value: c }))} placeholder="All Categories" />
        <AdminSelect value={filterGender} onChange={setFilterGender}
          options={GENDERS.map((g) => ({ label: g, value: g }))} placeholder="All Genders" />
        <AdminSelect value={filterLocation} onChange={setFilterLocation}
          options={locations} placeholder="All Locations" />
      </div>

      <AdminTable
        columns={columns}
        rows={displayed}
        keyExtractor={(s) => s.id}
        emptyMessage="No services match your filters."
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={toggleSort}
      />

      {showForm && (
        <AdminModal
          title={modalTitle}
          onClose={() => setShowForm(false)}
          footer={
            pendingMsg ? (
              <button onClick={() => setShowForm(false)} className="w-full px-4 py-2 text-sm bg-white/10 text-white rounded-lg">Close</button>
            ) : (
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving || !canSubmit}
                  className="px-4 py-2 text-sm bg-brand-green text-black rounded-lg hover:opacity-90 disabled:opacity-40">
                  {saving ? "Saving…" : editTarget ? (role === "manager" ? "Submit Request" : "Save") : role === "manager" ? "Submit Request" : "Add Service"}
                </button>
              </div>
            )
          }
        >
          {pendingMsg ? (
            <p className="text-green-400 text-sm">{pendingMsg}</p>
          ) : (
            <>
              {[
                { label: "Name", key: "name", placeholder: "e.g. Classic Haircut" },
                { label: "Category", key: "category", placeholder: "e.g. Hair" },
                { label: "Price (₹)", key: "price", placeholder: "e.g. 300" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-white/60 text-sm block mb-1">{label}</label>
                  <input value={form[key as keyof typeof form] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none [color-scheme:dark]" placeholder={placeholder} />
                </div>
              ))}
              <div>
                <label className="text-white/60 text-sm block mb-1">Gender</label>
                <AdminSelect value={form.gender} onChange={(v) => setForm({ ...form, gender: v || "Unisex" })}
                  options={GENDERS.map((g) => ({ label: g, value: g }))} placeholder="Select gender" className="w-full" />
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1">Location</label>
                <AdminSelect value={form.location_id} onChange={(v) => setForm({ ...form, location_id: v })}
                  options={locations} placeholder="All Locations" className="w-full" emptyIsValid />
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none resize-none" />
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1">Service Image</label>
                {imagePreview && (
                  <Image src={imagePreview} alt="preview" width={80} height={80} className="rounded-lg object-cover mb-2" unoptimized />
                )}
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="px-3 py-1.5 text-sm border border-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                  {imagePreview ? "Change Image" : "Upload Image"}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setImageFile(f);
                    setImagePreview(URL.createObjectURL(f));
                  }} />
              </div>
            </>
          )}
        </AdminModal>
      )}
    </div>
  );
}

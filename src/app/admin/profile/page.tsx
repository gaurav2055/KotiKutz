"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Upload, Save } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import Image from "next/image";

interface StaffProfile {
  id: string;
  bio: string | null;
  specialization: string | null;
  image_url: string | null;
  location_id: string | null;
}

export default function AdminProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [form, setForm] = useState({ bio: "", specialization: "", image_url: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    // Find staff record linked to this user's profile name
    supabase.from("profiles").select("name, first_name, last_name").eq("id", user.id).single().then(async ({ data: profileData }) => {
      const name = profileData?.first_name
        ? `${profileData.first_name} ${profileData.last_name ?? ""}`.trim()
        : profileData?.name ?? "";
      const { data: staffData } = await supabase.from("staff").select("*").ilike("name", name).maybeSingle();
      setProfile(staffData);
      if (staffData) setForm({ bio: staffData.bio ?? "", specialization: staffData.specialization ?? "", image_url: staffData.image_url ?? "" });
      setLoading(false);
    });
  }, [user, authLoading]);

  async function handleUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "staff");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.url) setForm((f) => ({ ...f, image_url: json.url }));
    setUploading(false);
  }

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    await supabase.from("staff").update({ bio: form.bio || null, specialization: form.specialization || null, image_url: form.image_url || null }).eq("id", profile.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (authLoading || loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;

  if (!profile) return (
    <div className="text-center pt-20">
      <p className="text-white/40 text-sm">No staff profile found for your account.</p>
      <p className="text-white/30 text-xs mt-1">Ask a super admin to create your staff record.</p>
    </div>
  );

  return (
    <div className="max-w-md space-y-5">
      {/* Photo */}
      <div>
        <label className="text-white/60 text-sm block mb-2">Photo</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
            {form.image_url ? (
              <Image src={form.image_url} alt="Profile" width={64} height={64} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white/30 text-xs">No photo</span>
            )}
          </div>
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
            <Upload size={14} /> {uploading ? "Uploading…" : "Upload Photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
        </div>
      </div>

      <div>
        <label className="text-white/60 text-sm block mb-1">Specialization</label>
        <input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })}
          placeholder="e.g. Fades & Beard Trims"
          className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none" />
      </div>

      <div>
        <label className="text-white/60 text-sm block mb-1">Bio</label>
        <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4}
          placeholder="Tell customers a bit about yourself…"
          className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none resize-none" />
      </div>

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 bg-brand-green text-black text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50">
        <Save size={16} /> {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  );
}

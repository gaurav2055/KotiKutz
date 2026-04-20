"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Upload, Save } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import Image from "next/image";
import AdminSelect from "@/components/ui/AdminSelect";

interface StaffProfile {
  id: string;
  bio: string | null;
  specialization: string | null;
  location_id: string | null;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function AdminProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [staffRecord, setStaffRecord] = useState<StaffProfile | null>(null);
  const [myName, setMyName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ bio: "", specialization: "", location_id: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [googleLinked, setGoogleLinked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    Promise.all([
      supabase.from("profiles").select("name, first_name, last_name, avatar_url").eq("id", user.id).single(),
      supabase.from("locations").select("id, name").order("name"),
      supabase.from("staff").select("id, bio, specialization, location_id").eq("id", user.id).maybeSingle(),
    ]).then(([{ data: profileData }, { data: locationData }, { data: staffData }]) => {
      // Check linked identities — user.identities is populated from the session
      const identities = user.identities ?? [];
      setGoogleLinked(identities.some((i) => i.provider === "google"));
      setLocations(locationData ?? []);

      const name = profileData?.first_name
        ? `${profileData.first_name} ${profileData.last_name ?? ""}`.trim()
        : profileData?.name ?? "";
      setMyName(name);
      setAvatarUrl(profileData?.avatar_url ?? null);

      setStaffRecord(staffData ?? null);
      if (staffData) {
        setForm({ bio: staffData.bio ?? "", specialization: staffData.specialization ?? "", location_id: staffData.location_id ?? "" });
      } else {
        setForm((f) => ({ ...f, location_id: locationData?.[0]?.id ?? "" }));
      }
      setLoading(false);
    });
  }, [user, authLoading]);

  // Upload to avatars bucket and update profiles.avatar_url — same as client ProfileSidebar
  async function handleUpload(file: File) {
    if (!user) return;
    setUploading(true);
    setError(null);

    const ext = file.name.split(".").pop();
    const newPath = `${user.id}/avatar.${ext}`;

    if (avatarUrl) {
      const oldPath = avatarUrl.split("/storage/v1/object/public/avatars/")[1];
      if (oldPath && oldPath !== newPath) {
        await supabase.storage.from("avatars").remove([oldPath]);
      }
    }

    const { error: uploadError } = await supabase.storage.from("avatars").upload(newPath, file, { upsert: true });
    if (uploadError) {
      setError(`Photo upload failed: ${uploadError.message}`);
    } else {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(newPath);
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
      if (updateError) setError(`Failed to save photo: ${updateError.message}`);
      else setAvatarUrl(publicUrl);
    }
    setUploading(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setError(null);
    const payload = {
      bio: form.bio || null,
      specialization: form.specialization || null,
      location_id: form.location_id || null,
    };

    const res = await fetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Save failed.");
      setSaving(false);
      return;
    }
    if (!staffRecord) setStaffRecord({ id: user.id, ...payload });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleLinkGoogle() {
    setLinkingGoogle(true);
    setError(null);
    const { error: linkError } = await supabase.auth.linkIdentity({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
    if (linkError) {
      setError(linkError.message === "manual_linking_disabled"
        ? "Google linking is disabled. Ask your super admin to enable it in the Supabase dashboard under Authentication → Settings → Enable manual linking."
        : linkError.message);
      setLinkingGoogle(false);
    }
    // On success, Supabase redirects to Google — no need to reset state
  }

  if (authLoading || loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-md space-y-5">
      {!staffRecord && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-yellow-400 text-sm">
          No staff profile found for <span className="font-medium">{myName || "your account"}</span>. Fill in the details below to create one.
        </div>
      )}

      {/* Photo — uploads to avatars bucket, updates profiles.avatar_url */}
      <div>
        <label className="text-white/60 text-sm block mb-2">Photo</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Profile" width={64} height={64} className="w-full h-full object-cover" unoptimized />
            ) : (
              <span className="text-white/30 text-xs">No photo</span>
            )}
          </div>
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
            <Upload size={14} /> {uploading ? "Uploading…" : avatarUrl ? "Change Photo" : "Upload Photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="text-white/60 text-sm block mb-1">Location</label>
        <AdminSelect
          value={form.location_id}
          onChange={(v) => setForm({ ...form, location_id: v })}
          options={locations.map((l) => ({ label: l.name, value: l.id }))}
          placeholder="— Unassigned —"
          className="w-full"
          emptyIsValid
        />
      </div>

      {/* Specialization */}
      <div>
        <label className="text-white/60 text-sm block mb-1">Specialization</label>
        <input
          value={form.specialization}
          onChange={(e) => setForm({ ...form, specialization: e.target.value })}
          placeholder="e.g. Fades & Beard Trims"
          className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="text-white/60 text-sm block mb-1">Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={4}
          placeholder="Tell customers a bit about yourself…"
          className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none resize-none"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving || uploading}
        className="flex items-center gap-2 px-5 py-2.5 bg-brand-green text-black text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
      >
        <Save size={16} />
        {saving ? "Saving…" : saved ? "Saved!" : staffRecord ? "Save Changes" : "Create Staff Profile"}
      </button>

      {/* Google account linking */}
      <div className="border-t border-white/10 pt-5">
        <p className="text-white/40 text-xs mb-3">Linked accounts let you sign in with Google in addition to your password.</p>
        {googleLinked ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-brand-green w-fit">
            <GoogleIcon />
            Google Connected
          </div>
        ) : (
          <button
            onClick={handleLinkGoogle}
            disabled={linkingGoogle}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/70 hover:text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            <GoogleIcon />
            {linkingGoogle ? "Redirecting…" : "Connect Google Account"}
          </button>
        )}
      </div>
    </div>
  );
}

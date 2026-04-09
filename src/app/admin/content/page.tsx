"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, Save } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import Image from "next/image";

interface ContentItem {
  key: string;
  value: string | null;
}

const IMAGE_KEYS = ["hero_image_home", "hero_image_services", "hero_image_about", "hero_image_appointments", "hero_image_testimonials"];

const KEY_LABELS: Record<string, string> = {
  hero_image_home:           "Hero Image — Home",
  hero_image_services:       "Hero Image — Services",
  hero_image_about:          "Hero Image — About",
  hero_image_appointments:   "Hero Image — Appointments",
  hero_image_testimonials:   "Hero Image — Testimonials",
  home_locations_description:"Home — Locations Description",
  about_story:               "About — Our Story",
  about_mission:             "About — Mission",
  about_portrait_url:        "About — Portrait Image URL",
  contact_phone:             "Contact Phone",
  contact_email:             "Contact Email",
};

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then(({ data }) => {
        setItems(data ?? []);
        const initEdits: Record<string, string> = {};
        (data ?? []).forEach((d: ContentItem) => { initEdits[d.key] = d.value ?? ""; });
        setEdits(initEdits);
        setLoading(false);
      });
  }, []);

  async function handleUpload(key: string, file: File) {
    setUploading(key);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "content");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.url) setEdits((e) => ({ ...e, [key]: json.url }));
    setUploading(null);
  }

  async function handleSave() {
    setSaving(true);
    const updates = Object.entries(edits).map(([key, value]) => ({ key, value }));
    await fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;

  const sortedItems = [...items].sort((a, b) => (KEY_LABELS[a.key] ?? a.key).localeCompare(KEY_LABELS[b.key] ?? b.key));

  return (
    <div className="max-w-2xl space-y-6">
      {sortedItems.map((item) => {
        const isImage = IMAGE_KEYS.includes(item.key);
        const label = KEY_LABELS[item.key] ?? item.key;
        const currentVal = edits[item.key] ?? "";

        return (
          <div key={item.key}>
            <label className="text-white/60 text-sm block mb-2">{label}</label>
            {isImage ? (
              <div className="space-y-2">
                {currentVal && (
                  <div className="relative h-32 rounded-lg overflow-hidden bg-white/5">
                    <Image src={currentVal} alt={label} fill className="object-cover" />
                  </div>
                )}
                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => fileRefs.current[item.key]?.click()}
                    className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <Upload size={14} /> {uploading === item.key ? "Uploading…" : "Upload Image"}
                  </button>
                  <input
                    ref={(el) => { fileRefs.current[item.key] = el; }}
                    type="file" accept="image/*" className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) handleUpload(item.key, e.target.files[0]); }}
                  />
                  <span className="text-white/30 text-xs truncate max-w-xs">{currentVal || "No image set"}</span>
                </div>
              </div>
            ) : (
              <textarea
                value={currentVal}
                onChange={(e) => setEdits({ ...edits, [item.key]: e.target.value })}
                rows={item.key.includes("story") || item.key.includes("mission") ? 4 : 1}
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none resize-none"
              />
            )}
          </div>
        );
      })}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 bg-brand-green text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <Save size={16} />
        {saving ? "Saving…" : saved ? "Saved!" : "Save All Changes"}
      </button>
    </div>
  );
}

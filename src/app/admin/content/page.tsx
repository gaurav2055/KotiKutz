"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Save } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import Image from "next/image";

interface ContentItem {
  key: string;
  value: string | null;
}

const IMAGE_KEYS = new Set([
  "hero_image_home", "hero_image_services", "hero_image_about",
  "hero_image_appointments", "hero_image_testimonials", "about_portrait_url",
]);

const KEY_LABELS: Record<string, string> = {
  hero_image_home:            "Hero Image",
  hero_image_services:        "Hero Image",
  hero_image_about:           "Hero Image",
  hero_image_appointments:    "Hero Image",
  hero_image_testimonials:    "Hero Image",
  home_locations_description: "Locations Section Description",
  about_story:                "Our Story",
  about_mission:              "Mission Statement",
  about_portrait_url:         "Portrait Image",
  contact_phone:              "Phone Number",
  contact_email:              "Email Address",
};

const PAGES = [
  { label: "Home",         keys: ["hero_image_home", "home_locations_description"] },
  { label: "Services",     keys: ["hero_image_services"] },
  { label: "About",        keys: ["hero_image_about", "about_story", "about_mission", "about_portrait_url"] },
  { label: "Appointments", keys: ["hero_image_appointments"] },
  { label: "Testimonials", keys: ["hero_image_testimonials"] },
  { label: "Contact",      keys: ["contact_phone", "contact_email"] },
];

export default function ContentPage() {
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // which tab is saving
  const [saved, setSaved] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(PAGES[0].label);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then(({ data }) => {
        const initEdits: Record<string, string> = {};
        (data ?? []).forEach((d: ContentItem) => { initEdits[d.key] = d.value ?? ""; });
        setEdits(initEdits);
        setLoading(false);
      });
  }, []);

  async function handleUpload(key: string, file: File) {
    setUploading(key);
    const currentUrl = edits[key];
    const prevPath = currentUrl
      ? currentUrl.split("/storage/v1/object/public/content/")[1] ?? null
      : null;
    const ext = file.name.split(".").pop();
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "content");
    fd.append("path", `${key}.${ext}`);
    if (prevPath) fd.append("prevPath", prevPath);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.url) setEdits((e) => ({ ...e, [key]: json.url }));
    setUploading(null);
  }

  async function handleSave(pageLabel: string, keys: string[]) {
    setSaving(pageLabel);
    const updates = keys.map((key) => ({ key, value: edits[key] ?? "" }));
    await fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    setSaving(null);
    setSaved(pageLabel);
    setTimeout(() => setSaved(null), 3000);
  }

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;

  const activePage = PAGES.find((p) => p.label === activeTab)!;

  return (
    <div className="max-w-2xl">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 bg-white/5 border border-white/10 rounded-xl p-1">
        {PAGES.map((page) => (
          <button
            key={page.label}
            onClick={() => setActiveTab(page.label)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeTab === page.label
                ? "bg-brand-green text-black font-medium"
                : "text-white/50 hover:text-white"
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      {/* Fields for active tab */}
      <div className="space-y-6">
        {activePage.keys.map((key) => {
          const isImage = IMAGE_KEYS.has(key);
          const label = KEY_LABELS[key] ?? key;
          const currentVal = edits[key] ?? "";

          return (
            <div key={key}>
              <label className="text-white/60 text-sm block mb-2">{label}</label>
              {isImage ? (
                <div className="space-y-2">
                  {currentVal && (
                    <div className="relative h-36 rounded-lg overflow-hidden bg-white/5">
                      <Image src={currentVal} alt={label} fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => fileRefs.current[key]?.click()}
                      className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg"
                    >
                      <Upload size={14} />
                      {uploading === key ? "Uploading…" : currentVal ? "Change Image" : "Upload Image"}
                    </button>
                    <input
                      ref={(el) => { fileRefs.current[key] = el; }}
                      type="file" accept="image/*" className="hidden"
                      onChange={(e) => { if (e.target.files?.[0]) handleUpload(key, e.target.files[0]); }}
                    />
                    <span className="text-white/30 text-xs truncate max-w-[200px]">
                      {currentVal ? "Image set" : "No image set"}
                    </span>
                  </div>
                </div>
              ) : (
                <textarea
                  value={currentVal}
                  onChange={(e) => setEdits({ ...edits, [key]: e.target.value })}
                  rows={key.includes("story") || key.includes("mission") ? 5 : 1}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none resize-none"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Per-page save button */}
      <div className="mt-8">
        <button
          onClick={() => handleSave(activePage.label, activePage.keys)}
          disabled={!!saving || !!uploading}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-green text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save size={16} />
          {saving === activePage.label
            ? "Saving…"
            : saved === activePage.label
              ? "Saved!"
              : `Save ${activePage.label} Content`}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import TextInput from "@/components/ui/TextInput";
import AdminSelect from "@/components/ui/AdminSelect";
import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/app/profile/page";

const GENDER_OPTIONS = [
  { label: "Male",   value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other",  value: "Other" },
];

type FormState = {
  first_name: string;
  last_name: string;
  phone: string;
  dob: string;
  gender: string;
  preferred_location_id: string;
};

type Props = {
  userId: string;
  profile: Profile;
  onSave: (updated: Partial<Profile>) => void;
};

export default function PersonalInfoForm({ userId, profile, onSave }: Props) {
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [locationOptions, setLocationOptions] = useState<{ label: string; value: string }[]>([]);

  const [form, setForm] = useState<FormState>({
    first_name:            profile.first_name ?? "",
    last_name:             profile.last_name ?? "",
    phone:                 profile.phone ?? "",
    dob:                   profile.dob ?? "",
    gender:                profile.gender ?? "",
    preferred_location_id: profile.preferred_location_id ?? "",
  });

  useEffect(() => {
    supabase
      .from("locations")
      .select("id, name")
      .then(({ data }) => {
        if (data) setLocationOptions(data.map((l) => ({ label: l.name, value: l.id })));
      });
  }, []);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const selectedLoc = locationOptions.find((l) => l.value === form.preferred_location_id);

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name:            form.first_name || null,
        last_name:             form.last_name || null,
        name:                  `${form.first_name} ${form.last_name}`.trim() || null,
        phone:                 form.phone || null,
        dob:                   form.dob || null,
        gender:                form.gender || null,
        preferred_location_id: form.preferred_location_id || null,
      })
      .eq("id", userId);

    if (error) { setError(error.message); setSaving(false); return; }

    onSave({
      first_name:              form.first_name,
      last_name:               form.last_name,
      name:                    `${form.first_name} ${form.last_name}`.trim(),
      phone:                   form.phone,
      dob:                     form.dob,
      gender:                  form.gender,
      preferred_location_id:   form.preferred_location_id,
      preferred_location_name: selectedLoc?.label ?? null,
    });

    setSaving(false);
    setEditing(false);
  }

  function handleCancel() {
    setForm({
      first_name:            profile.first_name ?? "",
      last_name:             profile.last_name ?? "",
      phone:                 profile.phone ?? "",
      dob:                   profile.dob ?? "",
      gender:                profile.gender ?? "",
      preferred_location_id: profile.preferred_location_id ?? "",
    });
    setError(null);
    setEditing(false);
  }

  return (
    <div className="rounded-[10px] border border-gray-200 p-5 md:p-8 mb-6">

      {/* Section title + edit button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-brand-green rounded-full" />
          <h2 className="text-xl font-bold text-black uppercase tracking-wide">Personal Information</h2>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        ) : (
          <button
            onClick={handleCancel}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>

      {/* View mode */}
      {!editing && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          {[
            { label: "First Name",    value: profile.first_name },
            { label: "Last Name",     value: profile.last_name  },
            { label: "Phone Number",  value: profile.phone      },
            { label: "Email Address", value: profile.email      },
            { label: "Date of Birth", value: profile.dob        },
            { label: "Gender",        value: profile.gender     },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-sm text-gray-500 mb-1">{label}</p>
              <p className="text-base font-medium text-black">{value ?? "—"}</p>
            </div>
          ))}
          <div className="sm:col-span-2">
            <p className="text-sm text-gray-500 mb-1">Preferred Location</p>
            <p className="text-base font-medium text-black">{profile.preferred_location_name ?? "—"}</p>
          </div>
        </div>
      )}

      {/* Edit mode */}
      {editing && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <TextInput label="First Name"   value={form.first_name} onChange={(v) => set("first_name", v)} />
            <TextInput label="Last Name"    value={form.last_name}  onChange={(v) => set("last_name", v)} />
            <TextInput label="Phone Number" value={form.phone}      onChange={(v) => set("phone", v)} />
            <div>
              <p className="text-sm text-gray-500 mb-1">Email Address</p>
              <p className="text-base font-medium text-black">{profile.email ?? "—"}</p>
              <p className="text-xs text-gray-400 mt-0.5">Email cannot be changed here</p>
            </div>
            <TextInput label="Date of Birth" value={form.dob}    onChange={(v) => set("dob", v)} />
            <div>
              <label className="block text-sm text-gray-600 mb-1">Gender</label>
              <AdminSelect
                value={form.gender}
                onChange={(v) => set("gender", v)}
                options={GENDER_OPTIONS}
                placeholder="Choose Gender"
                variant="light"
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm text-gray-600 mb-1">Preferred Location</label>
            <AdminSelect
              value={form.preferred_location_id}
              onChange={(v) => set("preferred_location_id", v)}
              options={locationOptions}
              placeholder="Choose Location"
              variant="light"
              className="w-full"
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button variant="dark" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

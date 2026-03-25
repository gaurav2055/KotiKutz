"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import TextInput from "@/components/ui/TextInput";
import Dropdown from "@/components/ui/Dropdown";
import Button from "@/components/ui/Button";

const GENDER_OPTIONS = [
  { label: "Male",   value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other",  value: "Other" },
];

const LOCATION_OPTIONS = [
  { label: "Porwal Road",     value: "Porwal Road" },
  { label: "Viman Nagar",     value: "Viman Nagar" },
  { label: "Dhanori",         value: "Dhanori" },
  { label: "Lohegaon",        value: "Lohegaon" },
  { label: "Dahisar, Mumbai", value: "Dahisar, Mumbai" },
];

const DEFAULT_FORM = {
  firstName: "Gaurav",
  lastName:  "Suvarna",
  phone:     "+91 9820571506",
  email:     "Jaygauravs@gmail.com",
  dob:       "04/12/1995",
  gender:    "Male",
  location:  "Viman Nagar",
};

export default function PersonalInfoForm() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved]     = useState(DEFAULT_FORM);
  const [form, setForm]       = useState(DEFAULT_FORM);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    setSaved(form);
    setEditing(false);
  }

  function handleCancel() {
    setForm(saved);
    setEditing(false);
  }

  return (
    <div className="rounded-[10px] border border-gray-200 p-8 mb-6">

      {/* Section title + edit button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-brand-green rounded-full" />
          <h2 className="text-xl font-bold text-black uppercase tracking-wide">Personal Information</h2>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        )}
        {editing && (
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
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          {[
            { label: "First Name",    value: saved.firstName },
            { label: "Last Name",     value: saved.lastName  },
            { label: "Phone Number",  value: saved.phone     },
            { label: "Email Address", value: saved.email     },
            { label: "Date of Birth", value: saved.dob       },
            { label: "Gender",        value: saved.gender    },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-sm text-gray-500 mb-1">{label}</p>
              <p className="text-base font-medium text-black">{value}</p>
            </div>
          ))}
          <div className="col-span-2">
            <p className="text-sm text-gray-500 mb-1">Preferred Location</p>
            <p className="text-base font-medium text-black">{saved.location}</p>
          </div>
        </div>
      )}

      {/* Edit mode */}
      {editing && (
        <>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <TextInput label="First Name"    value={form.firstName} onChange={(v) => set("firstName", v)} />
            <TextInput label="Last Name"     value={form.lastName}  onChange={(v) => set("lastName", v)} />
            <TextInput label="Phone Number"  value={form.phone}     onChange={(v) => set("phone", v)} />
            <TextInput label="Email Address" value={form.email}     onChange={(v) => set("email", v)} />
            <TextInput label="Date of Birth" value={form.dob}       onChange={(v) => set("dob", v)} />

            <div>
              <label className="block text-sm text-gray-600 mb-1">Gender</label>
              <Dropdown
                value={form.gender}
                onChange={(v) => set("gender", v)}
                options={GENDER_OPTIONS}
                placeholder="Choose Gender"
                variant="light"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm text-gray-600 mb-1">Preferred Location</label>
            <Dropdown
              value={form.location}
              onChange={(v) => set("location", v)}
              options={LOCATION_OPTIONS}
              placeholder="Choose Location"
              variant="light"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button variant="dark" onClick={handleSave}>Save Changes</Button>
          </div>
        </>
      )}

    </div>
  );
}

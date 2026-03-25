"use client";

import { UserCircle2 } from "lucide-react";
import DarkInput from "@/components/ui/DarkInput";
import Dropdown from "@/components/ui/Dropdown";
import type { BookingForm } from "./types";

const LOCATION_OPTIONS = [
  { label: "Porwal Road",     value: "Porwal Road" },
  { label: "Viman Nagar",     value: "Viman Nagar" },
  { label: "Dhanori",         value: "Dhanori" },
  { label: "Lohegaon",        value: "Lohegaon" },
  { label: "Dahisar, Mumbai", value: "Dahisar, Mumbai" },
];

type Props = {
  form: BookingForm;
  isLoggedIn: boolean;
  onUpdate: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
  onCancel: () => void;
  onNext: () => void;
};

export default function Step1Details({ form, isLoggedIn, onUpdate, onCancel, onNext }: Props) {
  const canNext = form.location !== "";

  return (
    <div>
      <div className="space-y-4 mb-6">

        {/* User info */}
        {isLoggedIn ? (
          <div className="border border-brand-green rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
              <UserCircle2 className="w-7 h-7 text-brand-green" />
            </div>
            <div>
              <p className="text-brand-green font-semibold text-sm">{form.name}</p>
              <p className="text-gray-400 text-xs">{form.email}</p>
            </div>
          </div>
        ) : (
          <>
            <DarkInput placeholder="Name"         value={form.name}  onChange={(v) => onUpdate("name", v)} />
            <DarkInput placeholder="Email"        value={form.email} onChange={(v) => onUpdate("email", v)} type="email" />
            <DarkInput placeholder="Phone Number" value={form.phone} onChange={(v) => onUpdate("phone", v)} type="tel" />
          </>
        )}

        {/* Location */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Location</label>
          <Dropdown
            value={form.location}
            onChange={(v) => onUpdate("location", v)}
            options={LOCATION_OPTIONS}
            placeholder="Choose Location"
            variant="dark"
          />
        </div>

        {/* Gender */}
        <div>
          <p className="text-xs text-gray-400 mb-2">Who is this appointment for?</p>
          <div className="grid grid-cols-2 gap-3">
            {(["Male", "Female"] as const).map((g) => (
              <button
                key={g}
                onClick={() => onUpdate("gender", g)}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  form.gender === g
                    ? "bg-brand-green text-black border-brand-green"
                    : "bg-[#1c1c1c] text-gray-400 border-gray-600 hover:border-gray-400"
                }`}
              >
                <span>{g === "Male" ? "♂" : "♀"}</span>
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mb-4" />

      <div className="flex justify-end gap-3">
        <ModalButton variant="outline" onClick={onCancel}>Cancel</ModalButton>
        <ModalButton variant="green"   onClick={onNext} disabled={!canNext}>Next</ModalButton>
      </div>
    </div>
  );
}

function ModalButton({ variant, onClick, disabled, children }: {
  variant: "outline" | "green";
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const styles = {
    outline: "border border-gray-600 text-gray-300 hover:bg-gray-800",
    green:   "bg-brand-green text-black hover:opacity-80 disabled:opacity-40",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2 text-sm rounded-full font-medium transition-all cursor-pointer disabled:cursor-not-allowed ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

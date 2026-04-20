"use client";

import { useState } from "react";
import { User, Clock, Calendar, CheckCircle2 } from "lucide-react";
import type { BookingForm } from "./types";

type Props = {
  form:      BookingForm;
  userId:    string;
  onBack:    () => void;
  onCancel:  () => void;
  onConfirm: () => void;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-700 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-[#f3f4f6] font-semibold">{value}</span>
    </div>
  );
}

export default function Step4Confirm({ form, userId, onBack, onCancel, onConfirm }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = form.services.reduce((sum, s) => sum + s.price, 0);
  const stylistLabel = form.staffName || "Any Available";

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        email:       form.email,
        locationId:  form.locationId,
        date:        form.date,
        timeSlot:    form.timeSlot,
        staffId:     form.staffId || null,
        services:    form.services.map((s) => s.id),
        totalPrice:  total,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Something went wrong."); setLoading(false); return; }
    setLoading(false);
    onConfirm();
  }

  return (
    <div>
      {/* Summary header */}
      <div className="flex items-center gap-2 mb-5">
        <CheckCircle2 className="w-5 h-5 text-brand-green" />
        <p className="text-sm text-brand-green font-semibold">Review your booking</p>
      </div>

      {/* Details card */}
      <div className="bg-[#1a1a1a] rounded-xl p-4 mb-5 space-y-1">
        <Row label="Name"     value={form.name} />
        <Row label="Email"    value={form.email} />
        <Row label="Phone"    value={form.phone} />
        <Row label="Location" value={form.location} />
        <Row label="For"      value={form.gender} />
      </div>

      {/* Services */}
      <div className="bg-[#1a1a1a] rounded-xl p-4 mb-5">
        <p className="text-xs font-bold text-gray-400 tracking-widest mb-3">SERVICES</p>
        {form.services.map((s) => (
          <div key={s.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
            <div>
              <p className="text-sm text-[#f3f4f6] font-medium">{s.name}</p>
              <p className="text-xs text-gray-500">{s.duration}</p>
            </div>
            <p className="text-sm text-[#f3f4f6] font-semibold">₹{s.price}</p>
          </div>
        ))}
        <div className="flex justify-between pt-3 mt-1">
          <p className="text-sm font-bold text-gray-300">Total</p>
          <p className="text-base font-bold text-brand-green">₹{total}</p>
        </div>
      </div>

      {/* Date / Time / Stylist */}
      <div className="bg-[#1a1a1a] rounded-xl p-4 mb-6 flex gap-6">
        <div className="flex items-center gap-2 text-sm text-[#f3f4f6]">
          <Calendar className="w-4 h-4 text-brand-green shrink-0" />
          {form.date}
        </div>
        <div className="flex items-center gap-2 text-sm text-[#f3f4f6]">
          <Clock className="w-4 h-4 text-brand-green shrink-0" />
          {form.timeSlot}
        </div>
        <div className="flex items-center gap-2 text-sm text-[#f3f4f6]">
          <User className="w-4 h-4 text-brand-green shrink-0" />
          {stylistLabel}
        </div>
      </div>

      <div className="border-t border-gray-700 mb-4" />

      {error && <p className="text-red-400 text-xs mb-3 text-center">{error}</p>}

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-white transition-colors">Back</button>
        <div className="flex gap-3">
          <ModalButton variant="outline" onClick={onCancel}>Cancel</ModalButton>
          <ModalButton variant="green" onClick={handleConfirm} disabled={loading}>
            {loading ? "Booking…" : "Confirm Booking"}
          </ModalButton>
        </div>
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
    green:   "bg-brand-green text-black hover:opacity-80",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2 text-sm rounded-full font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

"use client";

import Dropdown from "@/components/ui/Dropdown";
import type { BookingForm } from "./types";

const STYLIST_OPTIONS = [
  { label: "Any Available", value: "any"   },
  { label: "Ravi Kumar",    value: "ravi"  },
  { label: "Amit Singh",    value: "amit"  },
  { label: "Priya Sharma",  value: "priya" },
];

const TIME_SLOTS = [
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM",  "1:00 PM",  "1:30 PM",
   "2:00 PM",  "2:30 PM",  "3:00 PM",  "3:30 PM",
];

function toMinutes(slot: string): number {
  const [time, ampm] = slot.split(" ");
  const [h, m] = time.split(":").map(Number);
  const hour = ampm === "PM" && h !== 12 ? h + 12 : ampm === "AM" && h === 12 ? 0 : h;
  return hour * 60 + m;
}

function isSlotPast(slot: string, selectedDate: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  if (selectedDate !== today) return false;
  const now = new Date();
  return toMinutes(slot) <= now.getHours() * 60 + now.getMinutes();
}

type Props = {
  form: BookingForm;
  onUpdate: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
  onBack:   () => void;
  onCancel: () => void;
  onNext:   () => void;
};

export default function Step3DateTime({ form, onUpdate, onBack, onCancel, onNext }: Props) {
  const today    = new Date().toISOString().split("T")[0];
  const canNext  = form.date !== "" && form.timeSlot !== "";

  function handleDateChange(date: string) {
    // If selected date changes and current time slot is now in the past, clear it
    if (form.timeSlot && isSlotPast(form.timeSlot, date)) {
      onUpdate("timeSlot", "");
    }
    onUpdate("date", date);
  }

  return (
    <div>
      <div className="space-y-5 mb-6">

        {/* Date + Stylist row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Date</label>
            <input
              type="date"
              value={form.date}
              min={today}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full h-11 bg-[#1c1c1c] border border-[#333] rounded-xl px-4 text-sm text-white outline-none focus:border-brand-green transition-colors [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Stylist</label>
            <Dropdown
              value={form.stylist}
              onChange={(v) => onUpdate("stylist", v)}
              options={STYLIST_OPTIONS}
              placeholder="Any Available"
              variant="dark"
            />
          </div>
        </div>

        {/* Time slots */}
        <div>
          <p className="text-xs font-bold text-gray-400 tracking-widest mb-3">AVAILABLE TIME SLOTS</p>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => {
              const past     = isSlotPast(slot, form.date);
              const selected = form.timeSlot === slot;
              return (
                <button
                  key={slot}
                  onClick={() => !past && onUpdate("timeSlot", slot)}
                  disabled={past}
                  className={`py-2 text-sm rounded-xl border font-medium transition-colors ${
                    past
                      ? "bg-[#111] text-gray-700 border-[#222] cursor-not-allowed line-through"
                      : selected
                        ? "bg-brand-green text-black border-brand-green"
                        : "bg-[#1c1c1c] text-gray-300 border-[#333] hover:border-gray-500"
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
          {form.date === today && (
            <p className="text-xs text-gray-600 mt-2">Strikethrough slots are no longer available today.</p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-700 mb-4" />

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-white transition-colors">Back</button>
        <div className="flex gap-3">
          <ModalButton variant="outline" onClick={onCancel}>Cancel</ModalButton>
          <ModalButton variant="green"   onClick={onNext} disabled={!canNext}>Next</ModalButton>
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

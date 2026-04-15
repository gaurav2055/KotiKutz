"use client";

import { useEffect, useState } from "react";
import Dropdown from "@/components/ui/Dropdown";
import { supabase } from "@/lib/supabase";
import type { BookingForm } from "./types";

function generateSlots(openTime: string, closeTime: string, durationMin: number): string[] {
  const [openH, openM]   = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  const openTotal  = openH  * 60 + openM;
  const closeTotal = closeH * 60 + closeM;
  const slots: string[] = [];
  for (let mins = openTotal; mins < closeTotal; mins += durationMin) {
    const h    = Math.floor(mins / 60);
    const m    = mins % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const dh   = h > 12 ? h - 12 : h === 0 ? 12 : h;
    slots.push(`${dh}:${m.toString().padStart(2, "0")} ${ampm}`);
  }
  return slots;
}

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

type Booking       = { time_slot: string; staff_id: string | null };
type StaffOption   = { label: string; value: string };
type LocationSettings = {
  open_time: string;
  close_time: string;
  slot_duration_minutes: number;
  max_concurrent_bookings: number;
};

type Props = {
  form: BookingForm;
  onUpdate: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
  onBack:   () => void;
  onCancel: () => void;
  onNext:   () => void;
};

export default function Step3DateTime({ form, onUpdate, onBack, onCancel, onNext }: Props) {
  const [staffOptions,      setStaffOptions]      = useState<StaffOption[]>([]);
  const [locationSettings,  setLocationSettings]  = useState<LocationSettings | null>(null);
  const [bookings,          setBookings]           = useState<Booking[]>([]);
  const [staffCount,        setStaffCount]         = useState(0);
  const [loadingSlots,      setLoadingSlots]       = useState(false);

  // Load staff + location settings when location changes
  useEffect(() => {
    if (!form.locationId) return;

    supabase
      .from("staff")
      .select("id, profiles!staff_id_fkey(name, first_name, last_name)")
      .eq("location_id", form.locationId)
      .then(({ data }) => {
        const options: StaffOption[] = [];
        if (data) data.forEach((s: any) => {
          const p = s.profiles;
          const label = p?.first_name ? `${p.first_name} ${p.last_name ?? ""}`.trim() : p?.name ?? "Stylist";
          options.push({ label, value: s.id });
        });
        setStaffOptions(options);
      });

    supabase
      .from("locations")
      .select("open_time, close_time, slot_duration_minutes, max_concurrent_bookings")
      .eq("id", form.locationId)
      .single()
      .then(({ data }) => {
        if (data) setLocationSettings(data as LocationSettings);
      });
  }, [form.locationId]);

  // Load existing bookings + staff count when date or location changes
  useEffect(() => {
    if (!form.date || !form.locationId) {
      setBookings([]);
      setStaffCount(0);
      return;
    }
    setLoadingSlots(true);
    Promise.all([
      supabase
        .from("appointments")
        .select("time_slot, staff_id")
        .eq("location_id", form.locationId)
        .eq("appointment_date", form.date)
        .neq("status", "cancelled"),
      supabase
        .from("staff")
        .select("*", { count: "exact", head: true })
        .eq("location_id", form.locationId),
    ]).then(([{ data: appts }, { count }]) => {
      setBookings(appts ?? []);
      setStaffCount(count ?? 0);
      setLoadingSlots(false);
    });
  }, [form.date, form.locationId]);

  const timeSlots = locationSettings
    ? generateSlots(
        locationSettings.open_time,
        locationSettings.close_time,
        locationSettings.slot_duration_minutes
      )
    : [];

  // Effective capacity: min(staff at location, owner-set max)
  const effectiveCapacity = locationSettings
    ? Math.min(staffCount, locationSettings.max_concurrent_bookings)
    : staffCount;

  function isSlotFullyBooked(slot: string): boolean {
    if (effectiveCapacity === 0) return false;
    const slotTotal = bookings.filter((b) => b.time_slot === slot).length;
    if (slotTotal >= effectiveCapacity) return true;
    if (form.staffId) {
      return bookings.some((b) => b.time_slot === slot && b.staff_id === form.staffId);
    }
    return false;
  }

  const today   = new Date().toISOString().split("T")[0];
  const canNext = form.date !== "" && form.timeSlot !== "";

  function handleDateChange(date: string) {
    if (form.timeSlot && isSlotPast(form.timeSlot, date)) onUpdate("timeSlot", "");
    onUpdate("date", date);
  }

  function handleStaffChange(staffId: string) {
    const option = staffOptions.find((o) => o.value === staffId);
    onUpdate("staffId", staffId);
    onUpdate("staffName", option?.label ?? "Any Available");
    if (form.timeSlot && staffId && bookings.some((b) => b.time_slot === form.timeSlot && b.staff_id === staffId)) {
      onUpdate("timeSlot", "");
    }
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
              value={form.staffId}
              onChange={handleStaffChange}
              options={staffOptions}
              placeholder="Any Available"
              variant="dark"
            />
          </div>
        </div>

        {/* Time slots */}
        <div>
          <p className="text-xs font-bold text-gray-400 tracking-widest mb-3">
            AVAILABLE TIME SLOTS
            {loadingSlots && (
              <span className="ml-2 normal-case font-normal text-gray-600">Checking availability…</span>
            )}
          </p>

          {!form.locationId ? (
            <p className="text-sm text-gray-600">Select a location in Step 1 to see available slots.</p>
          ) : !form.date ? (
            <p className="text-sm text-gray-600">Pick a date to see available slots.</p>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => {
                  const past     = isSlotPast(slot, form.date);
                  const booked   = !past && isSlotFullyBooked(slot);
                  const selected = form.timeSlot === slot;
                  const disabled = past || booked;

                  return (
                    <button
                      key={slot}
                      onClick={() => !disabled && onUpdate("timeSlot", slot)}
                      disabled={disabled}
                      className={`py-2 text-sm rounded-xl border font-medium transition-colors ${
                        past
                          ? "bg-[#111] text-gray-700 border-[#222] cursor-not-allowed line-through"
                          : booked
                            ? "bg-[#1a0a0a] text-red-800 border-[#2a1010] cursor-not-allowed"
                            : selected
                              ? "bg-brand-green text-black border-brand-green"
                              : "bg-[#1c1c1c] text-gray-300 border-[#333] hover:border-gray-500"
                      }`}
                    >
                      {booked ? "Full" : slot}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                {form.date === today && <span>Strikethrough = past</span>}
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#1a0a0a] border border-[#2a1010] shrink-0" />
                  Full = no availability
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-gray-700 mb-4" />

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-white transition-colors">Back</button>
        <div className="flex gap-3">
          <ModalButton variant="outline" onClick={onCancel}>Cancel</ModalButton>
          <ModalButton variant="green" onClick={onNext} disabled={!canNext}>Next</ModalButton>
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

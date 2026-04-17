"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Dropdown from "@/components/ui/Dropdown";
import { supabase } from "@/lib/supabase";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Types ─────────────────────────────────────────────────────────────────────

type Booking      = { time_slot: string; staff_id: string | null };
type StaffOption  = { label: string; value: string };
type LocationOption = { label: string; value: string };
type LocationSettings = {
  open_time: string;
  close_time: string;
  slot_duration_minutes: number;
  max_concurrent_bookings: number;
};

type Props = {
  appointmentId:   string;
  locationId:      string;
  locationName:    string;
  currentDate:     string;
  currentTimeSlot: string;
  currentStaffId:  string | null;
  userId:          string;
  onClose:         () => void;
  onRescheduled:   (updated: {
    locationId: string;
    locationName: string;
    date: string;
    timeSlot: string;
    staffId: string | null;
    staffName: string;
  }) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function RescheduleModal({
  appointmentId,
  locationId: initLocationId,
  locationName: initLocationName,
  currentDate, currentTimeSlot, currentStaffId,
  userId, onClose, onRescheduled,
}: Props) {
  // Location
  const [locationOptions,  setLocationOptions]  = useState<LocationOption[]>([]);
  const [locationId,       setLocationId]        = useState(initLocationId);
  const [locationName,     setLocationName]      = useState(initLocationName);

  // Staff
  const [staffOptions,     setStaffOptions]      = useState<StaffOption[]>([]);
  const [staffId,          setStaffId]           = useState(currentStaffId ?? "");
  const [staffName,        setStaffName]         = useState("");

  // Date / slots
  const [locationSettings, setLocationSettings]  = useState<LocationSettings | null>(null);
  const [bookings,         setBookings]          = useState<Booking[]>([]);
  const [staffCount,       setStaffCount]        = useState(0);
  const [loadingSlots,     setLoadingSlots]      = useState(false);
  const [date,             setDate]              = useState(currentDate);
  const [timeSlot,         setTimeSlot]          = useState(currentTimeSlot);

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // Load all locations once
  useEffect(() => {
    supabase
      .from("locations")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        if (data) setLocationOptions(data.map((l) => ({ label: l.name, value: l.id })));
      });
  }, []);

  // When location changes: reload staff + settings, clear slot/staff selection
  useEffect(() => {
    if (!locationId) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStaffId("");
    setStaffName("");
    setTimeSlot("");
    setStaffOptions([]);
    setLocationSettings(null);

    supabase
      .from("staff")
      .select("id, profiles!staff_id_fkey(name, first_name, last_name)")
      .eq("location_id", locationId)
      .then(({ data }) => {
        type StaffRow = { id: string; profiles: { name: string | null; first_name: string | null; last_name: string | null } | null };
        const options: StaffOption[] = [];
        if (data) {
          (data as unknown as StaffRow[]).forEach((s) => {
            const p = s.profiles;
            const label = p?.first_name ? `${p.first_name} ${p.last_name ?? ""}`.trim() : p?.name ?? "Stylist";
            options.push({ label, value: s.id });
          });
          // Restore previous staff if they work at this location
          const found = (data as unknown as StaffRow[]).find((s) => s.id === currentStaffId);
          if (found && locationId === initLocationId) {
            const p = found.profiles;
            const name = p?.first_name ? `${p.first_name} ${p.last_name ?? ""}`.trim() : p?.name ?? "Stylist";
            setStaffId(found.id);
            setStaffName(name);
          }
        }
        setStaffOptions(options);
      });

    supabase
      .from("locations")
      .select("open_time, close_time, slot_duration_minutes, max_concurrent_bookings")
      .eq("id", locationId)
      .single()
      .then(({ data }) => { if (data) setLocationSettings(data as LocationSettings); });
  }, [locationId, initLocationId, currentStaffId]);

  // When date or location changes: reload booked slots (excluding current appointment)
  useEffect(() => {
    if (!date || !locationId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingSlots(true);
    Promise.all([
      supabase
        .from("appointments")
        .select("time_slot, staff_id")
        .eq("location_id", locationId)
        .eq("appointment_date", date)
        .neq("status", "cancelled")
        .neq("id", appointmentId),
      supabase
        .from("staff")
        .select("*", { count: "exact", head: true })
        .eq("location_id", locationId),
    ]).then(([{ data: appts }, { count }]) => {
      setBookings(appts ?? []);
      setStaffCount(count ?? 0);
      setLoadingSlots(false);
    });
  }, [date, locationId, appointmentId]);

  const timeSlots = locationSettings
    ? generateSlots(locationSettings.open_time, locationSettings.close_time, locationSettings.slot_duration_minutes)
    : [];

  const effectiveCapacity = locationSettings
    ? Math.min(staffCount, locationSettings.max_concurrent_bookings)
    : staffCount;

  function isSlotFullyBooked(slot: string): boolean {
    if (effectiveCapacity === 0) return false;
    if (bookings.filter((b) => b.time_slot === slot).length >= effectiveCapacity) return true;
    if (staffId) return bookings.some((b) => b.time_slot === slot && b.staff_id === staffId);
    return false;
  }

  function handleLocationChange(newId: string) {
    const option = locationOptions.find((o) => o.value === newId);
    setLocationId(newId);
    setLocationName(option?.label ?? "");
  }

  function handleStaffChange(newStaffId: string) {
    const option = staffOptions.find((o) => o.value === newStaffId);
    setStaffId(newStaffId);
    setStaffName(option?.label ?? "Any Available");
    if (timeSlot && newStaffId && bookings.some((b) => b.time_slot === timeSlot && b.staff_id === newStaffId)) {
      setTimeSlot("");
    }
  }

  function handleDateChange(newDate: string) {
    if (timeSlot && isSlotPast(timeSlot, newDate)) setTimeSlot("");
    setDate(newDate);
  }

  async function handleConfirm() {
    if (!date || !timeSlot) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/appointments/${appointmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        action:     "reschedule",
        locationId,
        date,
        timeSlot,
        staffId:    staffId || null,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }

    onRescheduled({
      locationId,
      locationName,
      date,
      timeSlot,
      staffId:   staffId || null,
      staffName: staffName || "Any Available",
    });
  }

  const today   = new Date().toISOString().split("T")[0];
  const canNext = date !== "" && timeSlot !== "";

  return (
    <Modal theme="dark" width="w-[560px]" scrollable onClose={onClose}>
      <h2 className="text-lg font-bold text-white mb-5">Reschedule Appointment</h2>

      <div className="space-y-5 mb-6">

        {/* Location + Date row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Location</label>
            <Dropdown
              value={locationId}
              onChange={handleLocationChange}
              options={locationOptions}
              placeholder="Choose Location"
              variant="dark"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">New Date</label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full h-11 bg-[#1c1c1c] border border-[#333] rounded-xl px-4 text-sm text-white outline-none focus:border-brand-green transition-colors [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Stylist */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Stylist</label>
          <Dropdown
            value={staffId}
            onChange={handleStaffChange}
            options={staffOptions}
            placeholder="Any Available"
            variant="dark"
          />
        </div>

        {/* Time slots */}
        <div>
          <p className="text-xs font-bold text-gray-400 tracking-widest mb-3">
            SELECT NEW TIME SLOT
            {loadingSlots && (
              <span className="ml-2 normal-case font-normal text-gray-600">Checking availability…</span>
            )}
          </p>

          {!locationId ? (
            <p className="text-sm text-gray-600">Select a location to see available slots.</p>
          ) : !date ? (
            <p className="text-sm text-gray-600">Pick a date to see available slots.</p>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => {
                  const past     = isSlotPast(slot, date);
                  const booked   = !past && isSlotFullyBooked(slot);
                  const selected = timeSlot === slot;
                  const disabled = past || booked;

                  return (
                    <button
                      key={slot}
                      onClick={() => !disabled && setTimeSlot(slot)}
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
                {date === today && <span>Strikethrough = past</span>}
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#1a0a0a] border border-[#2a1010] shrink-0" />
                  Full = no availability
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {error && <p className="text-red-400 text-xs mb-4 text-center">{error}</p>}

      <div className="border-t border-gray-700 mb-4" />

      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          disabled={submitting}
          className="px-5 py-2 text-sm border border-gray-600 text-gray-300 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={!canNext || submitting}
          className="px-5 py-2 text-sm bg-brand-green text-black rounded-full font-medium hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving…" : "Confirm Reschedule"}
        </button>
      </div>
    </Modal>
  );
}

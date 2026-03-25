"use client";

import { useState } from "react";
import StatsRow              from "@/components/appointments/StatsRow";
import AppointmentTabs       from "@/components/appointments/AppointmentTabs";
import AppointmentCard       from "@/components/appointments/AppointmentCard";
import BookAppointmentModal  from "@/components/appointments/BookAppointmentModal";
import Dropdown              from "@/components/ui/Dropdown";
import type { AppointmentTab }  from "@/components/appointments/AppointmentTabs";
import type { AppointmentStatus } from "@/components/appointments/AppointmentCard";

const APPOINTMENTS: {
  id: number;
  dayNum: string;
  monthYear: string;
  dayLabel: string;
  service: string;
  location: string;
  stylist: string;
  time: string;
  status: AppointmentStatus;
  price: string;
  tab: AppointmentTab;
}[] = [
  {
    id: 1,
    dayNum: "05", monthYear: "MAR 2026", dayLabel: "Thu, 5 Mar 2026",
    service: "Hair Cut + Beard Styling + Hair Spa",
    location: "Viman Nagar", stylist: "Ravi Kumar", time: "1:30 PM · ~90 min",
    status: "confirmed", price: "₹990", tab: "upcoming",
  },
  {
    id: 2,
    dayNum: "05", monthYear: "MAR 2026", dayLabel: "Thu, 5 Mar 2026",
    service: "Hair Cut + Beard Styling + Hair Spa",
    location: "Viman Nagar", stylist: "Ravi Kumar", time: "1:30 PM · ~90 min",
    status: "pending", price: "₹990", tab: "upcoming",
  },
  {
    id: 3,
    dayNum: "12", monthYear: "FEB 2026", dayLabel: "Thu, 12 Feb 2026",
    service: "Hair Cut + Beard Styling",
    location: "Viman Nagar", stylist: "Ravi Kumar", time: "11:00 AM · ~50 min",
    status: "completed", price: "₹550", tab: "past",
  },
  {
    id: 4,
    dayNum: "28", monthYear: "JAN 2026", dayLabel: "Wed, 28 Jan 2026",
    service: "Regular Hair Cut",
    location: "Dhanori", stylist: "Amit Singh", time: "10:00 AM · ~30 min",
    status: "completed", price: "₹350", tab: "past",
  },
  {
    id: 5,
    dayNum: "05", monthYear: "MAR 2026", dayLabel: "Thu, 5 Mar 2026",
    service: "Hair Cut + Beard Styling + Hair Spa",
    location: "Viman Nagar", stylist: "Ravi Kumar", time: "3:00 PM · ~90 min",
    status: "cancelled", price: "₹990", tab: "cancelled",
  },
];

const LOCATION_OPTIONS = [
  { label: "Porwal Road",     value: "Porwal Road" },
  { label: "Viman Nagar",     value: "Viman Nagar" },
  { label: "Dhanori",         value: "Dhanori" },
  { label: "Lohegaon",        value: "Lohegaon" },
  { label: "Dahisar, Mumbai", value: "Dahisar, Mumbai" },
];

export default function AppointmentsPage() {
  const [activeTab,    setActiveTab]    = useState<AppointmentTab>("upcoming");
  const [location,     setLocation]     = useState("");
  const [modalOpen,    setModalOpen]    = useState(false);

  const filtered = APPOINTMENTS.filter(
    (a) =>
      a.tab === activeTab &&
      (location === "" || a.location === location)
  );

  const upcomingCount = APPOINTMENTS.filter((a) => a.tab === "upcoming").length;

  return (
    <main className="max-w-[1440px] mx-auto px-16 py-12">

      {/* Page title */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-black">My Appointments</h1>
          <p className="text-gray-500 mt-1">Manage and track all your bookings</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-brand-dark text-white px-5 py-3 rounded-[10px] text-sm font-medium hover:opacity-80 transition-opacity"
        >
          + Book Appointment
        </button>
      </div>

      {/* Stats */}
      <StatsRow />

      {/* Tabs */}
      <AppointmentTabs active={activeTab} onChange={setActiveTab} upcomingCount={upcomingCount} />

      {/* Location filter */}
      <div className="mb-5 w-48">
        <Dropdown
          value={location}
          onChange={setLocation}
          options={LOCATION_OPTIONS}
          placeholder="Choose Location"
          variant="light"
        />
      </div>

      {/* Appointment list */}
      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm py-12 text-center">No appointments found.</p>
      ) : (
        filtered.map((a) => (
          <AppointmentCard key={a.id} {...a} onBookAgain={() => setModalOpen(true)} />
        ))
      )}

      {/* Booking modal */}
      {modalOpen && (
        <BookAppointmentModal onClose={() => setModalOpen(false)} isLoggedIn={false} />
      )}
    </main>
  );
}

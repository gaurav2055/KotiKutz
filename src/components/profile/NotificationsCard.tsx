"use client";

import { useState } from "react";
import Toggle from "@/components/ui/Toggle";

const NOTIFICATIONS = [
  { key: "booking",      label: "Booking Confirmation",   description: "Receive an email as soon as your appointment is confirmed" },
  { key: "reminder",     label: "Appointment Reminder",   description: "Reminder email sent 24 hours before your booking" },
  { key: "cancellation", label: "Cancellation Notice",    description: "Email if your appointment is cancelled or rescheduled" },
  { key: "offers",       label: "Offers & Promotions",    description: "Be the first to hear about deals and seasonal offers" },
];

export default function NotificationsCard() {
  const [settings, setSettings] = useState({
    booking:      true,
    reminder:     true,
    cancellation: true,
    offers:       true,
  });

  return (
    <div className="rounded-[10px] border border-gray-200 p-8 mb-6">

      {/* Section title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-brand-green rounded-full" />
        <h2 className="text-xl font-bold text-black uppercase tracking-wide">Notifications</h2>
      </div>

      <div className="space-y-6">
        {NOTIFICATIONS.map((n) => (
          <div key={n.key} className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-black">{n.label}</p>
              <p className="text-sm text-gray-500 mt-0.5">{n.description}</p>
            </div>
            <Toggle
              value={settings[n.key as keyof typeof settings]}
              onChange={(val) => setSettings((prev) => ({ ...prev, [n.key]: val }))}
            />
          </div>
        ))}
      </div>

    </div>
  );
}

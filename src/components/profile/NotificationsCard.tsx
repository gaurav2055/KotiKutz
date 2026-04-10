"use client";

import { useEffect, useState } from "react";
import Toggle from "@/components/ui/Toggle";
import { supabase } from "@/lib/supabase";

const NOTIFICATIONS = [
  { key: "booking",      label: "Booking Confirmation",  description: "Receive an email as soon as your appointment is confirmed" },
  { key: "reminder",     label: "Appointment Reminder",  description: "Reminder email sent 24 hours before your booking" },
  { key: "cancellation", label: "Cancellation Notice",   description: "Email if your appointment is cancelled or rescheduled" },
  { key: "offers",       label: "Offers & Promotions",   description: "Be the first to hear about deals and seasonal offers" },
];

type Prefs = { booking: boolean; reminder: boolean; cancellation: boolean; offers: boolean };

const DEFAULTS: Prefs = { booking: true, reminder: true, cancellation: true, offers: true };

type Props = { userId: string };

export default function NotificationsCard({ userId }: Props) {
  const [settings, setSettings] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("notification_preferences")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data?.notification_preferences) {
          setSettings({ ...DEFAULTS, ...data.notification_preferences });
        }
      });
  }, [userId]);

  async function handleToggle(key: keyof Prefs, val: boolean) {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    await supabase
      .from("profiles")
      .update({ notification_preferences: updated })
      .eq("id", userId);
  }

  return (
    <div className="rounded-[10px] border border-gray-200 p-5 md:p-8 mb-6">

      {/* Section title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-brand-green rounded-full" />
        <h2 className="text-xl font-bold text-black uppercase tracking-wide">Notifications</h2>
      </div>

      <div className="space-y-6">
        {NOTIFICATIONS.map((n) => (
          <div key={n.key} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-base font-medium text-black">{n.label}</p>
              <p className="text-sm text-gray-500 mt-0.5">{n.description}</p>
            </div>
            <Toggle
              value={settings[n.key as keyof Prefs]}
              onChange={(val) => handleToggle(n.key as keyof Prefs, val)}
            />
          </div>
        ))}
      </div>

    </div>
  );
}

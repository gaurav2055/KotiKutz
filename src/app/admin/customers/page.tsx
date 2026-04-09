"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

interface Customer {
  id: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
}

interface Booking {
  id: string;
  appointment_date: string;
  time_slot: string;
  status: string;
  total_price: number | null;
  locations: { name: string } | null;
  appointment_services: { services: { name: string } | null }[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/customers");
    const json = await res.json();
    setCustomers(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  async function openCustomer(c: Customer) {
    setSelected(c);
    setBookings([]);
    setBookingsLoading(true);
    const res = await fetch(`/api/admin/customers?userId=${c.id}`);
    const json = await res.json();
    setBookings(json.data ?? []);
    setBookingsLoading(false);
  }

  function customerName(c: Customer) {
    if (c.first_name) return `${c.first_name} ${c.last_name ?? ""}`.trim();
    return c.name ?? c.email ?? "—";
  }

  function formatDate(d: string) {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm text-white">
          <thead>
            <tr className="border-b border-white/10 text-white/40 text-left">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} onClick={() => openCustomer(c)}
                className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                <td className="px-4 py-3">{customerName(c)}</td>
                <td className="px-4 py-3 text-white/60">{c.email ?? "—"}</td>
                <td className="px-4 py-3 text-white/60">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-white/60">
                  {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-over */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md bg-[#1a1a1a] border-l border-white/10 h-full overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">{customerName(selected)}</h2>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>
            <div className="text-white/50 text-sm space-y-1">
              <p>{selected.email}</p>
              {selected.phone && <p>{selected.phone}</p>}
            </div>
            <h3 className="text-white/60 text-sm font-medium pt-2 border-t border-white/10">Booking History</h3>
            {bookingsLoading ? <Spinner size="lg" /> : bookings.length === 0 ? (
              <p className="text-white/30 text-sm">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="bg-white/5 rounded-lg p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white">{formatDate(b.appointment_date)} · {b.time_slot}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        b.status === "confirmed" ? "bg-green-500/20 text-green-400" :
                        b.status === "cancelled" ? "bg-red-500/20 text-red-400" :
                        "bg-white/10 text-white/50"
                      }`}>{b.status}</span>
                    </div>
                    <div className="text-white/50">{b.locations?.name ?? "—"}</div>
                    <div className="text-white/40">{b.appointment_services.map((s) => s.services?.name).filter(Boolean).join(", ")}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

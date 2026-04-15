"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import AdminTable, { type ColumnDef } from "@/components/admin/AdminTable";

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

const STATUS_BADGE: Record<string, string> = {
  confirmed: "bg-green-500/20 text-green-400",
  completed: "bg-blue-500/20 text-blue-400",
  cancelled:  "bg-red-500/20 text-red-400",
  pending:    "bg-yellow-500/20 text-yellow-400",
  no_show:    "bg-gray-500/20 text-gray-400",
};

function customerName(c: Customer) {
  if (c.first_name) return `${c.first_name} ${c.last_name ?? ""}`.trim();
  return c.name ?? c.email ?? "—";
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
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

  const columns: ColumnDef<Customer>[] = [
    { label: "Name",   render: (c) => customerName(c) },
    { label: "Email",  render: (c) => <span className="text-white/60">{c.email ?? "—"}</span> },
    { label: "Phone",  render: (c) => <span className="text-white/60">{c.phone ?? "—"}</span> },
    {
      label: "Joined",
      render: (c) => (
        <span className="text-white/60">
          {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <AdminTable
        columns={columns}
        rows={customers}
        keyExtractor={(c) => c.id}
        emptyMessage="No customers found."
        onRowClick={openCustomer}
      />

      {/* Slide-over panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-md bg-[#1a1a1a] border-l border-white/10 h-full overflow-y-auto p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">{customerName(selected)}</h2>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="text-white/50 text-sm space-y-1">
              {selected.email && <p>{selected.email}</p>}
              {selected.phone && <p>{selected.phone}</p>}
              <p className="text-white/30 text-xs">
                Joined {new Date(selected.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h3 className="text-white/60 text-sm font-medium mb-3">Booking History</h3>
              {bookingsLoading ? (
                <div className="flex justify-center py-8"><Spinner size="lg" /></div>
              ) : bookings.length === 0 ? (
                <p className="text-white/30 text-sm">No bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div key={b.id} className="bg-white/5 rounded-lg p-3 text-sm space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-white">{formatDate(b.appointment_date)} · {b.time_slot}</span>
                        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[b.status] ?? "bg-white/10 text-white/50"}`}>
                          {b.status === "no_show" ? "missed" : b.status}
                        </span>
                      </div>
                      <div className="text-white/50">{b.locations?.name ?? "—"}</div>
                      <div className="text-white/40">
                        {b.appointment_services.map((s) => s.services?.name).filter(Boolean).join(", ") || "—"}
                      </div>
                      {b.total_price != null && (
                        <div className="text-white/40">₹{b.total_price.toLocaleString()}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

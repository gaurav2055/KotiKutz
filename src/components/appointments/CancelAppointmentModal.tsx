"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { AlertTriangle } from "lucide-react";

type Props = {
  service:   string;
  dayLabel:  string;
  location:  string;
  onClose:   () => void;
  onConfirm: () => Promise<void>;
};

export default function CancelAppointmentModal({ service, dayLabel, location, onClose, onConfirm }: Props) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Modal theme="light" width="w-[440px]" onClose={onClose}>
      <div className="flex flex-col items-center text-center">

        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>

        <h2 className="text-xl font-bold text-black mb-2">Cancel Appointment?</h2>
        <p className="text-sm text-gray-500 mb-1">You are about to cancel:</p>

        <div className="w-full bg-gray-50 rounded-[10px] p-4 my-4 text-left space-y-1.5">
          <p className="text-sm font-semibold text-black">{service}</p>
          <p className="text-xs text-gray-500">{dayLabel}</p>
          <p className="text-xs text-gray-500">{location}</p>
        </div>

        <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>

        {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium border border-gray-300 text-black rounded-[10px] hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Keep Appointment
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium bg-red-500 text-white rounded-[10px] hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Cancelling…" : "Yes, Cancel"}
          </button>
        </div>

      </div>
    </Modal>
  );
}

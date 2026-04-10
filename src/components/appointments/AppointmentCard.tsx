import { MapPin, User, Clock } from "lucide-react";
import type { AppointmentTab } from "@/components/appointments/AppointmentTabs";

export type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled" | "missed";

type Props = {
  id: string;
  tab: AppointmentTab;
  dayNum: string;
  monthYear: string;
  dayLabel: string;
  service: string;
  location: string;
  stylist: string;
  time: string;
  status: AppointmentStatus;
  price: string;
  onBookAgain?:  () => void;
  onCancel?:     () => void;
  onReschedule?: () => void;
};

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; className: string }> = {
  confirmed: { label: "Confirmed",           className: "text-green-600 bg-green-50"    },
  pending:   { label: "Pending Confirmation", className: "text-amber-600 bg-amber-50"   },
  completed: { label: "Completed",            className: "text-gray-500 bg-gray-100"    },
  cancelled: { label: "Cancelled",            className: "text-red-500 bg-red-50"       },
  missed:    { label: "Missed",               className: "text-orange-500 bg-orange-50" },
};

export default function AppointmentCard({
  tab, dayNum, monthYear, dayLabel, service, location, stylist, time,
  status, price, onBookAgain, onCancel, onReschedule,
}: Props) {
  const s        = STATUS_CONFIG[status];
  const upcoming = tab === "upcoming";
  const missed   = tab === "missed";

  const borderLeft =
    status === "cancelled" ? "border-l-red-500"
    : missed               ? "border-l-orange-400"
    : upcoming             ? "border-l-brand-green"
    :                        "border-l-gray-200";

  const dateColor =
    status === "cancelled"   ? "text-red-500"
    : missed                 ? "text-orange-400"
    : status === "completed" ? "text-gray-400"
    : "text-black";

  const priceColor = status === "cancelled" ? "text-red-500" : "text-black";

  return (
    <div className={`border border-gray-200 border-l-4 ${borderLeft} rounded-[10px] p-4 md:p-5 mb-4`}>

      {/* Mobile layout: stacked. Desktop layout: horizontal flex */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">

        {/* Date block — row on mobile (date + status badge), column on desktop */}
        <div className="flex sm:flex-col items-center sm:items-center justify-between sm:justify-start gap-2 sm:gap-0 mb-3 sm:mb-0 shrink-0">
          <div className="text-center sm:w-20">
            <p className={`text-3xl md:text-4xl font-bold leading-none ${dateColor}`}>{dayNum}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase">{monthYear}</p>
          </div>
          {/* Status badge — visible on mobile next to date, hidden on desktop (shown below) */}
          <span className={`sm:hidden text-xs px-2 py-0.5 rounded-full font-medium ${s.className}`}>
            • {s.label}
          </span>
        </div>

        <div className="hidden sm:block w-px h-16 bg-gray-200 shrink-0" />

        {/* Service details */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-black mb-1.5">{service}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{location}</span>
            <span className="flex items-center gap-1"><User className="w-3 h-3" />{stylist}</span>
            {upcoming && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{time}</span>}
          </div>
          {/* Status badge — hidden on mobile (shown above), visible on desktop */}
          <span className={`hidden sm:inline text-xs px-2 py-0.5 rounded-full font-medium ${s.className}`}>
            • {s.label}
          </span>
        </div>

        {/* Price + day label + actions */}
        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 mt-3 sm:mt-0 shrink-0">
          <div className="sm:text-right">
            <p className="text-xs text-gray-500">{dayLabel}</p>
            <p className={`text-base font-bold ${priceColor}`}>{price}</p>
          </div>

          <div className="flex gap-2 sm:flex-col sm:items-end">
            {upcoming ? (
              <>
                <button
                  onClick={onReschedule}
                  className="px-3 sm:w-28 py-1.5 text-sm border border-gray-300 text-black rounded-[8px] hover:bg-gray-50 transition-colors"
                >
                  Reschedule
                </button>
                <button
                  onClick={onCancel}
                  className="px-3 sm:w-28 py-1.5 text-sm border border-red-400 text-red-500 rounded-[8px] hover:bg-red-50 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={onBookAgain}
                className="px-3 sm:w-28 py-1.5 text-sm border border-gray-300 text-black rounded-[8px] hover:bg-gray-50 transition-colors"
              >
                Book Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

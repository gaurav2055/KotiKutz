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
    <div className={`border border-gray-200 border-l-4 ${borderLeft} rounded-[10px] p-5 flex items-center gap-6 mb-4`}>

      {/* Date block */}
      <div className="shrink-0 text-center w-20">
        <p className={`text-4xl font-bold leading-none ${dateColor}`}>{dayNum}</p>
        <p className="text-sm text-gray-500 mt-1 uppercase">{monthYear}</p>
      </div>

      <div className="w-px h-16 bg-gray-200 shrink-0" />

      {/* Service details */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-black mb-1.5">{service}</p>
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{location}</span>
          <span className="flex items-center gap-1"><User className="w-3 h-3" />{stylist}</span>
          {upcoming && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{time}</span>}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.className}`}>
          • {s.label}
        </span>
      </div>

      {/* Price + actions */}
      <div className="shrink-0 flex flex-col items-end gap-2">
        <p className="text-xs text-gray-500">{dayLabel}</p>
        <p className={`text-base font-bold ${priceColor}`}>{price}</p>

        {upcoming ? (
          <>
            <button
              onClick={onReschedule}
              className="w-28 py-1.5 text-sm border border-gray-300 text-black rounded-[8px] hover:bg-gray-50 transition-colors"
            >
              Reschedule
            </button>
            <button
              onClick={onCancel}
              className="w-28 py-1.5 text-sm border border-red-400 text-red-500 rounded-[8px] hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={onBookAgain}
            className="w-28 py-1.5 text-sm border border-gray-300 text-black rounded-[8px] hover:bg-gray-50 transition-colors"
          >
            Book Again
          </button>
        )}
      </div>
    </div>
  );
}

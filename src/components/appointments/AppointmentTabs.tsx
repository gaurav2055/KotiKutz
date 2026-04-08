"use client";

export type AppointmentTab = "upcoming" | "past" | "missed" | "cancelled";

type Props = {
  active: AppointmentTab;
  onChange: (tab: AppointmentTab) => void;
  upcomingCount: number;
};

const TABS: { key: AppointmentTab; label: string }[] = [
  { key: "upcoming",  label: "Upcoming"  },
  { key: "past",      label: "Past"      },
  { key: "missed",    label: "Missed"    },
  { key: "cancelled", label: "Cancelled" },
];

export default function AppointmentTabs({ active, onChange, upcomingCount }: Props) {
  return (
    <div className="border-b border-gray-200 mb-5">
      <div className="flex gap-8">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 -mb-px transition-colors ${
              active === tab.key
                ? "border-brand-green text-black"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            {tab.label}
            {tab.key === "upcoming" && upcomingCount > 0 && (
              <span className="bg-brand-dark text-white text-xs rounded-full w-5 h-5 flex items-center justify-center leading-none">
                {upcomingCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

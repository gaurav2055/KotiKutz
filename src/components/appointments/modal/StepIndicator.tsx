import { Check } from "lucide-react";

const STEPS = ["Details", "Service", "Date & Time", "Confirm"];

export default function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-7">
      <div className="flex justify-between mb-3">
        {STEPS.map((label, i) => {
          const num  = i + 1;
          const done   = num < current;
          const active = num === current;

          return (
            <div key={label} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1.5 ${
                done    ? "border-brand-green bg-brand-green"
                : active ? "border-brand-green"
                : "border-gray-600"
              }`}>
                {done
                  ? <Check className="w-4 h-4 text-black" strokeWidth={3} />
                  : <span className={`text-sm font-semibold ${active ? "text-brand-green" : "text-gray-500"}`}>{num}</span>
                }
              </div>
              <span className={`text-xs ${active || done ? "text-brand-green" : "text-gray-500"}`}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="relative h-0.5 bg-gray-700 rounded-full">
        <div
          className="absolute left-0 top-0 h-full bg-brand-green rounded-full transition-all duration-300"
          style={{ width: `${(current / 4) * 100}%` }}
        />
      </div>
    </div>
  );
}

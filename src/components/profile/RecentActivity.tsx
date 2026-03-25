// TODO: Replace with real activity data from backend
const ACTIVITIES = [
  { id: 1, service: "Hair Cut + Beard Styling", location: "Viman Nagar", stylist: "Ravi K.", date: "12 Feb 2026", amount: "₹450" },
  { id: 2, service: "Hair Cut + Beard Styling", location: "Viman Nagar", stylist: "Ravi K.", date: "12 Feb 2026", amount: "₹450" },
  { id: 3, service: "Hair Cut + Beard Styling", location: "Viman Nagar", stylist: "Ravi K.", date: "12 Feb 2026", amount: "₹450" },
];

export default function RecentActivity() {
  return (
    <div className="rounded-[10px] border border-gray-200 p-8">

      {/* Section title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-brand-green rounded-full" />
        <h2 className="text-xl font-bold text-black uppercase tracking-wide">Recent Activity</h2>
      </div>

      <div className="space-y-5">
        {ACTIVITIES.map((a) => (
          <div key={a.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Commute icon */}
              <div className="text-gray-500 shrink-0">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M17 12V5a3 3 0 0 0-6 0v1H5v13h14v-7h-2zM11 5a1 1 0 0 1 2 0v1h-2V5zm8 14H5V8h6V5a3 3 0 0 1 6 0v3h2v11z"/>
                  <path d="M7 15h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-black">{a.service}</p>
                <p className="text-sm text-gray-500">{a.location} · Stylist: {a.stylist}</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs text-gray-500">{a.date}</p>
              <p className="text-base font-bold text-black">{a.amount}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

const STATS = [
  { label: "Total Visits",       value: "12",          sub: "Since Jan 2024" },
  { label: "Upcoming",           value: "2",           sub: "Appointments Scheduled" },
  { label: "Preferred Location", value: "Viman Nagar", sub: "Most Visited Branch" },
];

export default function StatsRow() {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {STATS.map((s) => (
        <div key={s.label} className="relative border border-gray-200 rounded-[10px] p-5 overflow-hidden">
          <p className="text-sm text-gray-500 mb-1">{s.label}</p>
          <p className="text-3xl font-bold text-black mb-1">{s.value}</p>
          <p className="text-sm text-gray-500">{s.sub}</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-green" />
        </div>
      ))}
    </div>
  );
}

// StatCard — small KPI tile with icon, value, and label.
export default function StatCard({ icon, value, label, accent = 'navy' }) {
  const accentMap = {
    navy: 'bg-navy-50 text-navy-700',
    success: 'bg-success-50 text-success-700',
    accent: 'bg-accent-50 text-accent-600',
    amber: 'bg-amber-50 text-amber-700',
  };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl grid place-items-center text-xl ${accentMap[accent]}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-navy-900 leading-none">{value}</div>
        <div className="text-sm text-navy-500 mt-1">{label}</div>
      </div>
    </div>
  );
}

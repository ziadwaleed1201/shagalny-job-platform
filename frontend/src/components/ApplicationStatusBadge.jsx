// ApplicationStatusBadge — visual indicator for an application's lifecycle state.
export default function ApplicationStatusBadge({ status = 'applied' }) {
  const map = {
    applied:     { label: 'Applied',     cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    shortlisted: { label: 'Shortlisted', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    hired:       { label: 'Hired',       cls: 'bg-success-50 text-success-700 border-success-200' },
    rejected:    { label: 'Not Selected', cls: 'bg-red-50 text-red-700 border-red-200' },
    completed:   { label: 'Completed',   cls: 'bg-navy-50 text-navy-700 border-navy-200' },
  };
  const c = map[status] || map.applied;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {c.label}
    </span>
  );
}

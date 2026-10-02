// DashboardCard — generic card wrapper with a title and optional action.
export default function DashboardCard({ title, action, children, className = '' }) {
  return (
    <section className={`card p-5 ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between mb-4">
          {title && <h3 className="text-base font-semibold text-navy-900">{title}</h3>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

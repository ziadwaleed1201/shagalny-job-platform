import { NavLink } from 'react-router-dom';

// Sidebar — used inside dashboard layouts to navigate dashboard subsections.
// Pass `items` as [{ to, label, icon, count }, ...] and a `title`.
export default function Sidebar({ title = 'Menu', items = [] }) {
  return (
    <aside className="card p-3 lg:sticky lg:top-20 lg:h-fit">
      <div className="px-2 pb-2 mb-2 border-b border-navy-100">
        <p className="text-xs uppercase tracking-wider text-navy-400 font-semibold">{title}</p>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-navy-50 text-navy-900 font-semibold'
                  : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
              }`
            }
          >
            <span className="w-5 text-center">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.count != null && (
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-navy-100 text-navy-700 font-semibold">
                {item.count}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

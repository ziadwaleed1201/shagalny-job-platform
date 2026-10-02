// SearchFilters — filter panel used on the Job Listing page.
// Controlled by parent state via the `filters` prop and `onChange` callback.
export default function SearchFilters({ filters, onChange, onReset }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <aside className="card p-5 sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-navy-900">Filters</h3>
        <button onClick={onReset} className="text-xs text-navy-500 hover:text-navy-700">
          Reset
        </button>
      </div>

      <div className="space-y-5">
        {/* Location */}
        <div>
          <label className="label">Location</label>
          <select
            className="input"
            value={filters.location}
            onChange={(e) => set('location', e.target.value)}
          >
            <option value="">All cities</option>
            <option>Cairo</option>
            <option>Giza</option>
            <option>Alexandria</option>
            <option>Remote</option>
          </select>
        </div>

        {/* Job type */}
        <div>
          <label className="label">Job type</label>
          <div className="space-y-1.5">
            {['Event', 'Retail', 'Marketing', 'Food & Beverage', 'Remote'].map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.jobTypes.includes(t)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...filters.jobTypes, t]
                      : filters.jobTypes.filter((x) => x !== t);
                    set('jobTypes', next);
                  }}
                  className="w-4 h-4 rounded text-navy-600 focus:ring-navy-500"
                />
                <span className="text-navy-700">{t}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Salary */}
        <div>
          <label className="label">
            Minimum salary: <span className="text-navy-900 font-semibold">{filters.minSalary} EGP</span>
          </label>
          <input
            type="range"
            min="0"
            max="2000"
            step="50"
            value={filters.minSalary}
            onChange={(e) => set('minSalary', Number(e.target.value))}
            className="w-full accent-navy-700"
          />
          <div className="flex justify-between text-xs text-navy-400 mt-1">
            <span>0</span>
            <span>2000+</span>
          </div>
        </div>

        {/* Shift length */}
        <div>
          <label className="label">Shift length</label>
          <select
            className="input"
            value={filters.shiftLength}
            onChange={(e) => set('shiftLength', e.target.value)}
          >
            <option value="">Any length</option>
            <option value="short">Up to 4 hours</option>
            <option value="medium">4 to 8 hours</option>
            <option value="long">8+ hours</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="label">Date from</label>
          <input
            type="date"
            className="input"
            value={filters.dateFrom}
            onChange={(e) => set('dateFrom', e.target.value)}
          />
        </div>

        {/* Verified only */}
        <label className="flex items-center gap-2 text-sm cursor-pointer pt-2 border-t border-navy-100">
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => set('verifiedOnly', e.target.checked)}
            className="w-4 h-4 rounded text-success-600 focus:ring-success-500"
          />
          <span className="font-medium text-navy-800">Verified employers only</span>
        </label>
      </div>
    </aside>
  );
}

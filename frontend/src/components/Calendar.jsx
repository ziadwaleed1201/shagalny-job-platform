import { useState } from 'react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

// Local-safe YYYY-MM-DD key (no UTC drift).
function ymd(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt)) return '';
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}
function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function buildCells(year, month) {
  const startDow = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// ---------- Month calendar that displays events ----------
// events: [{ date, label, sublabel }]
export function MonthCalendar({ events = [], emptyLabel = 'Nothing scheduled for this day.' }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(ymd(today));

  const byDay = {};
  events.forEach((e) => {
    const k = ymd(e.date);
    if (k) (byDay[k] = byDay[k] || []).push(e);
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = buildCells(year, month);
  const todayKey = ymd(today);
  const dayEvents = byDay[selected] || [];

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="w-8 h-8 rounded-lg hover:bg-navy-50 text-navy-600 text-lg leading-none">‹</button>
          <p className="font-bold text-navy-900">{MONTHS[month]} {year}</p>
          <button type="button" onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="w-8 h-8 rounded-lg hover:bg-navy-50 text-navy-600 text-lg leading-none">›</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-navy-400 mb-1">
          {WEEKDAYS.map((w) => <div key={w} className="py-1">{w}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((c, i) => {
            if (!c) return <div key={i} />;
            const k = ymd(c);
            const has = byDay[k];
            const isToday = k === todayKey;
            const isSel = k === selected;
            return (
              <button type="button" key={i} onClick={() => setSelected(k)}
                className={`aspect-square rounded-lg text-sm flex flex-col items-center justify-center transition
                  ${isSel ? 'bg-navy-700 text-white' : isToday ? 'bg-navy-50 text-navy-900 font-semibold' : 'hover:bg-navy-50 text-navy-700'}`}>
                <span>{c.getDate()}</span>
                {has && <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSel ? 'bg-white' : 'bg-accent-500'}`} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:border-l border-navy-100 lg:pl-5">
        <p className="text-xs uppercase tracking-wider text-navy-400 font-semibold mb-2">
          {fromKey(selected).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
        {dayEvents.length === 0 ? (
          <p className="text-sm text-navy-400">{emptyLabel}</p>
        ) : (
          <ul className="space-y-2">
            {dayEvents.map((e, i) => (
              <li key={i} className="p-3 rounded-xl bg-navy-50/60 border border-navy-100">
                <p className="font-semibold text-navy-900 text-sm">{e.label}</p>
                {e.sublabel && <p className="text-xs text-navy-500 mt-0.5">{e.sublabel}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ---------- Click-to-pick date field ----------
// value: 'YYYY-MM-DD' string. onChange(newKey). min: optional 'YYYY-MM-DD' to block earlier days.
export function DatePicker({ value, onChange, min }) {
  const [open, setOpen] = useState(false);
  const base = value ? fromKey(value) : new Date();
  const [cursor, setCursor] = useState(new Date(base.getFullYear(), base.getMonth(), 1));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = buildCells(year, month);
  const todayKey = ymd(new Date());

  function pick(c) {
    const k = ymd(c);
    if (min && k < min) return;
    onChange(k);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="input w-full text-left flex items-center justify-between">
        <span className={value ? 'text-navy-900' : 'text-navy-400'}>
          {value ? fromKey(value).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'Select a date'}
        </span>
        <span className="text-navy-400">📅</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute z-40 mt-2 w-72 rounded-2xl border border-navy-100 bg-white p-3 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <button type="button" onClick={() => setCursor(new Date(year, month - 1, 1))}
                className="w-8 h-8 rounded-lg hover:bg-navy-50 text-navy-600 text-lg leading-none">‹</button>
              <p className="font-semibold text-sm text-navy-900">{MONTHS[month]} {year}</p>
              <button type="button" onClick={() => setCursor(new Date(year, month + 1, 1))}
                className="w-8 h-8 rounded-lg hover:bg-navy-50 text-navy-600 text-lg leading-none">›</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-navy-400 mb-1">
              {WEEKDAYS.map((w) => <div key={w}>{w[0]}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((c, i) => {
                if (!c) return <div key={i} />;
                const k = ymd(c);
                const disabled = min && k < min;
                const isSel = k === value;
                const isToday = k === todayKey;
                return (
                  <button type="button" key={i} disabled={disabled} onClick={() => pick(c)}
                    className={`aspect-square rounded-lg text-sm transition
                      ${isSel ? 'bg-navy-700 text-white' : isToday ? 'bg-navy-50 font-semibold text-navy-900' : 'hover:bg-navy-50 text-navy-700'}
                      ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}>
                    {c.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

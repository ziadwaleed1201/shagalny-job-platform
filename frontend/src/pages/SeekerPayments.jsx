import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { Cards } from '../lib/api';

// Demo data so the flow is visible during the defense (no real payments needed).
const DEMO_PAYMENTS = [
  { id: 'p1', job: 'Event Hostess for Tech Conference', company: 'Pyramid Events Co.', amount: 800, status: 'released', date: '2026-06-03' },
  { id: 'p2', job: 'Brand Ambassador for Mall Activation', company: 'Bright Marketing Agency', amount: 1200, status: 'escrow', date: '2026-06-07' },
  { id: 'p3', job: 'Waiter for Private Wedding', company: 'Cairo Festivals Group', amount: 600, status: 'pending', date: '2026-06-08' },
  { id: 'p4', job: 'Retail Assistant', company: 'NileMart Retail', amount: 450, status: 'refunded', date: '2026-05-29' },
];

const STATUS = {
  pending:  { label: 'Awaiting payment',     cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  escrow:   { label: 'Held in escrow',       cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  released: { label: 'Paid to your card',    cls: 'bg-success-50 text-success-700 border-success-200' },
  refunded: { label: 'Refunded to company',  cls: 'bg-navy-50 text-navy-600 border-navy-200' },
};

export default function SeekerPayments() {
  const { user } = useAuth();
  const [card, setCard] = useState(null);

  // Show the seeker's real saved card if they have one; otherwise a placeholder.
  useEffect(() => {
    Cards.list().then((list) => setCard(Array.isArray(list) && list[0] ? list[0] : null)).catch(() => {});
  }, []);

  const payments = DEMO_PAYMENTS;
  const sum = (st) => payments.filter((p) => p.status === st).reduce((s, p) => s + p.amount, 0);
  const earned = sum('released');
  const inEscrow = sum('escrow');
  const pending = sum('pending');

  return (
    <div>
      <Navbar />
      <div className="section py-8 animate-fade-in">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold">Payments</h1>
          <p className="text-navy-500 mt-1">Track how your earnings move from the company to your card.</p>
        </header>

        {/* How you get paid — escrow flow */}
        <div className="card p-6 mb-6">
          <h2 className="text-sm uppercase tracking-wider text-navy-500 font-semibold mb-4">How you get paid</h2>
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <FlowNode icon="🏢" title="Company pays" desc="Employer charges their card" tone="navy" />
            <Arrow />
            <FlowNode icon="🛡️" title="Held in escrow" desc="Shagalny secures the funds" tone="blue" />
            <Arrow />
            <FlowNode icon="💳" title="Released to you" desc="Sent to your payout card" tone="success" />
          </div>
        </div>

        {/* Summary */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <Summary label="Total earned" value={`${earned} EGP`} accent="success" />
          <Summary label="In escrow" value={`${inEscrow} EGP`} accent="blue" />
          <Summary label="Awaiting payment" value={`${pending} EGP`} accent="amber" />
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Payments list */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100">
              <h2 className="font-bold">Your payments</h2>
            </div>
            <div className="divide-y divide-navy-50">
              {payments.map((p) => {
                const s = STATUS[p.status];
                return (
                  <div key={p.id} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-navy-900 truncate">{p.job}</p>
                      <p className="text-sm text-navy-500">{p.company} · {new Date(p.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-navy-900">{p.amount} EGP</p>
                      <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />{s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payout card + escrow note */}
          <aside className="space-y-4">
            <div className="card p-5">
              <h2 className="font-bold mb-3">Your payout card</h2>
              <div className="rounded-2xl p-5 bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-soft">
                <div className="flex justify-between text-xs uppercase tracking-wider text-white/80">
                  <span>Payout card</span>
                  <span className="capitalize">{card?.cardType || 'visa'}</span>
                </div>
                <p className="mt-6 text-lg tracking-widest font-mono">
                  {card?.cardNumber || '**** **** **** 4242'}
                </p>
                <div className="mt-4 flex justify-between text-xs text-white/80">
                  <span>{user?.fullName?.toUpperCase() || 'YOUR NAME'}</span>
                  <span>{card?.expiryDate || '08/27'}</span>
                </div>
              </div>
              <Link to="/cards" className="btn-outline w-full text-sm mt-4 justify-center">Manage cards</Link>
            </div>

            <div className="card p-5 bg-navy-900 text-white">
              <p className="font-semibold">Escrow protection</p>
              <p className="text-sm text-navy-200 mt-1">
                Companies pay upfront into escrow. Your money is secured before the shift and released to you once the job is done.
              </p>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function FlowNode({ icon, title, desc, tone }) {
  const tones = {
    navy: 'bg-navy-50 text-navy-700',
    blue: 'bg-blue-50 text-blue-700',
    success: 'bg-success-50 text-success-700',
  };
  return (
    <div className="flex-1 rounded-xl border border-navy-100 p-4 text-center">
      <div className={`w-12 h-12 rounded-xl grid place-items-center text-2xl mx-auto ${tones[tone]}`}>{icon}</div>
      <p className="mt-2 font-semibold text-navy-900">{title}</p>
      <p className="text-xs text-navy-500">{desc}</p>
    </div>
  );
}

function Arrow() {
  return <div className="grid place-items-center text-navy-300 text-2xl rotate-90 sm:rotate-0">→</div>;
}

function Summary({ label, value, accent }) {
  const map = { success: 'text-success-600', blue: 'text-blue-600', amber: 'text-amber-600' };
  return (
    <div className="card p-5">
      <p className="text-sm text-navy-500">{label}</p>
      <p className={`text-2xl font-extrabold mt-1 ${map[accent]}`}>{value}</p>
    </div>
  );
}

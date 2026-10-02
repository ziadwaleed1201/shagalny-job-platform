import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { paymentApi } from '../lib/api';

const badge = {
  Held: 'bg-accent-50 text-accent-600',
  Completed: 'bg-success-50 text-success-700',
  Failed: 'bg-red-50 text-red-600',
};

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setPayments(await paymentApi.listAll()); }
      catch (e) { toast.error(e.response?.data?.message || 'Could not load payments'); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-semibold text-navy-700">Payments</h1>
      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-card">
        {loading ? (
          <div className="h-24 animate-pulse bg-navy-50" />
        ) : payments.length === 0 ? (
          <p className="p-5 text-sm text-navy-400">No payments yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-navy-50 text-left text-xs uppercase tracking-wide text-navy-500">
              <tr>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-t border-navy-50">
                  <td className="px-4 py-3 text-navy-700">{p.job?.title || '—'}</td>
                  <td className="px-4 py-3 text-navy-500">{p.vacancy?.vacancyName || '—'}</td>
                  <td className="px-4 py-3 text-navy-700">{p.amount} EGP</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge[p.paymentStatus?.name] || 'bg-navy-50 text-navy-500'}`}>
                      {p.paymentStatus?.name || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

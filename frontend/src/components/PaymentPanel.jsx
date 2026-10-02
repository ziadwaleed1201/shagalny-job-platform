import { useState } from 'react';
import toast from 'react-hot-toast';
import { paymentApi } from '../lib/api';

const statusStyles = {
  Held: 'bg-accent-50 text-accent-600',
  Completed: 'bg-success-50 text-success-700',
  Failed: 'bg-red-50 text-red-600',
};

// Drop this into a company's applicants view for a HIRED applicant.
// Props: jobId, jobSeekerId, suggestedAmount (optional)
export default function PaymentPanel({ jobId, jobSeekerId, suggestedAmount = '' }) {
  const [amount, setAmount] = useState(suggestedAmount);
  const [payment, setPayment] = useState(null);
  const [txns, setTxns] = useState([]);
  const [busy, setBusy] = useState(false);

  const status = payment?.paymentStatus?.name || (payment ? 'Held' : null);

  const refresh = async (id) => {
    try {
      const data = await paymentApi.get(id);
      setPayment(data.payment);
      setTxns(data.transactions);
    } catch { /* ignore */ }
  };

  const initiate = async () => {
    if (!amount || Number(amount) <= 0) return toast.error('Enter a valid amount');
    setBusy(true);
    try {
      const res = await paymentApi.initiate({ jobId, jobSeekerId, amount: Number(amount) });
      toast.success('Payment held in escrow');
      setPayment(res.payment);
      setTxns(res.transactions);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not start payment');
    } finally {
      setBusy(false);
    }
  };

  const release = async () => {
    setBusy(true);
    try {
      await paymentApi.release(payment._id);
      toast.success('Funds released to the job seeker');
      await refresh(payment._id);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not release');
    } finally { setBusy(false); }
  };

  const refund = async () => {
    setBusy(true);
    try {
      await paymentApi.refund(payment._id);
      toast.success('Payment refunded');
      await refresh(payment._id);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not refund');
    } finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy-700">Payment</h3>
        {status && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[status] || 'bg-navy-50 text-navy-500'}`}>
            {status}
          </span>
        )}
      </div>

      {!payment ? (
        <div className="mt-3 flex gap-2">
          <input
            className="w-32 rounded-xl border border-navy-100 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
            placeholder="Amount" inputMode="numeric"
            value={amount} onChange={(e) => setAmount(e.target.value)}
          />
          <button
            onClick={initiate} disabled={busy}
            className="rounded-xl bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
          >
            {busy ? 'Holding…' : 'Hold in escrow'}
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-navy-500">Amount: <span className="font-semibold text-navy-700">{payment.amount} EGP</span></p>

          {status === 'Held' && (
            <div className="flex gap-2">
              <button onClick={release} disabled={busy}
                className="rounded-xl bg-success-500 px-4 py-2 text-sm font-semibold text-white hover:bg-success-600 disabled:opacity-60">
                Release to seeker
              </button>
              <button onClick={refund} disabled={busy}
                className="rounded-xl border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-600 hover:bg-navy-50 disabled:opacity-60">
                Refund
              </button>
            </div>
          )}

          {txns.length > 0 && (
            <ul className="mt-2 space-y-1 border-t border-navy-50 pt-2">
              {txns.map((t) => (
                <li key={t._id} className="flex items-center justify-between text-xs text-navy-400">
                  <span className="font-medium uppercase tracking-wide text-navy-500">{t.type}</span>
                  <span>{t.amount} EGP · {t.transactionStatus}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

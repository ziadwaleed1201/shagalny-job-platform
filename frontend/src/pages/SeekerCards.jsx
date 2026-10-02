import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { cardApi } from '../lib/api';

export default function SeekerCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ cardNumber: '', expiryDate: '', cardType: 'visa' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setCards(await cardApi.list());
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not load cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.cardNumber || !form.expiryDate) return toast.error('Card number and expiry are required');
    setSaving(true);
    try {
      await cardApi.add(form);
      toast.success('Card added');
      setForm({ cardNumber: '', expiryDate: '', cardType: 'visa' });
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not add card');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-semibold text-navy-700">Payment cards</h1>
      <p className="mt-1 text-sm text-navy-400">Your card is where employers send your payout when a job is completed.</p>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-card">
        <h2 className="text-sm font-semibold text-navy-600">Add a card</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-xl border border-navy-100 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
            placeholder="Card number" inputMode="numeric"
            value={form.cardNumber}
            onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
          />
          <input
            className="rounded-xl border border-navy-100 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
            placeholder="MM/YY"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          />
          <select
            className="rounded-xl border border-navy-100 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
            value={form.cardType}
            onChange={(e) => setForm({ ...form, cardType: e.target.value })}
          >
            <option value="visa">Visa</option>
            <option value="mastercard">Mastercard</option>
            <option value="meeza">Meeza</option>
            <option value="other">Other</option>
          </select>
          <button
            onClick={submit} disabled={saving}
            className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600 disabled:opacity-60"
          >
            {saving ? 'Adding…' : 'Add card'}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="h-16 animate-pulse rounded-2xl bg-navy-50" />
        ) : cards.length === 0 ? (
          <p className="text-sm text-navy-400">No cards yet.</p>
        ) : (
          cards.map((c) => (
            <div key={c._id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-card">
              <div>
                <p className="font-medium text-navy-700">{c.cardNumber}</p>
                <p className="text-xs uppercase tracking-wide text-navy-400">{c.cardType} · exp {c.expiryDate}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

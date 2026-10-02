import { useState } from 'react';
import Modal from './Modal';

// Detect the card brand from the leading digits (visual only).
function detectType(num) {
  const n = (num || '').replace(/\D/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n)) return 'mastercard';
  if (/^(50|5[6-9]|6)/.test(n)) return 'meeza';
  return 'other';
}

function formatCardNumber(v) {
  return (v || '').replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

// Drop this next to "Mark complete" in the Hired Workers row:
//   <PaySeekerButton seekerName={a.user?.name} jobTitle={a.job?.title} amount={a.job?.salary} />
export default function PaySeekerButton({ seekerName = 'the worker', jobTitle = '', amount = '', className = '' }) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState('form'); // form | processing | done
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [amt, setAmt] = useState(amount || '');

  const type = card.number ? detectType(card.number) : 'visa';
  const last4 = card.number.replace(/\D/g, '').slice(-4);

  function reset() {
    setStage('form');
    setCard({ name: '', number: '', expiry: '', cvv: '' });
    setAmt(amount || '');
  }
  function close() { setOpen(false); setTimeout(reset, 200); }

  function pay() {
    setStage('processing');
    // Visual demo only — no real charge. To make it real later, plug in here:
    //   await Cards.add({ cardNumber: card.number, expiryDate: card.expiry, cardType: type, cardholderName: card.name });
    //   await Payments.initiate({ amount: Number(amt), ... });
    setTimeout(() => setStage('done'), 1300);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={`btn-accent text-xs ${className}`}>
        Pay worker
      </button>

      <Modal
        open={open}
        onClose={close}
        title={stage === 'done' ? 'Payment held in escrow' : 'Pay worker'}
        footer={
          stage === 'form' ? (
            <>
              <button onClick={close} className="btn-ghost text-sm">Cancel</button>
              <button
                onClick={pay}
                disabled={!card.number || !card.expiry || !amt}
                className="btn-accent text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Pay {amt ? `${amt} EGP` : ''} into escrow
              </button>
            </>
          ) : stage === 'done' ? (
            <button onClick={close} className="btn-primary text-sm">Done</button>
          ) : null
        }
      >
        {stage === 'form' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-navy-50 text-sm text-navy-700">
              Paying <strong className="text-navy-900">{seekerName}</strong>
              {jobTitle ? <> for <strong className="text-navy-900">{jobTitle}</strong></> : null}.
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Amount (EGP)</label>
              <input
                className="input w-full" type="number" min="0" value={amt}
                onChange={(e) => setAmt(e.target.value)} placeholder="800"
              />
            </div>

            {/* Live card preview */}
            <div className="rounded-2xl p-5 bg-gradient-to-br from-navy-800 to-navy-600 text-white shadow-soft">
              <div className="flex justify-between items-start">
                <span className="text-xs uppercase tracking-wider text-white/70">Company card</span>
                <span className="text-sm font-semibold capitalize">{type}</span>
              </div>
              <p className="mt-6 text-lg tracking-widest font-mono">
                {card.number ? formatCardNumber(card.number) : '•••• •••• •••• ••••'}
              </p>
              <div className="mt-4 flex justify-between text-xs text-white/80">
                <span>{card.name || 'CARDHOLDER NAME'}</span>
                <span>{card.expiry || 'MM/YY'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Cardholder name</label>
              <input
                className="input w-full" value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value })}
                placeholder="e.g. El Zoz Software"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Card number</label>
              <input
                className="input w-full" inputMode="numeric" value={formatCardNumber(card.number)}
                onChange={(e) => setCard({ ...card, number: e.target.value })}
                placeholder="4242 4242 4242 4242"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Expiry (MM/YY)</label>
                <input
                  className="input w-full" value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: e.target.value.replace(/[^\d/]/g, '').slice(0, 5) })}
                  placeholder="08/27"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">CVV</label>
                <input
                  className="input w-full" inputMode="numeric" value={card.cvv}
                  onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  placeholder="123"
                />
              </div>
            </div>

            <p className="text-xs text-navy-400">
              Demo only — no real payment is processed. The amount would be held by Shagalny in escrow and released to the worker once the job is completed.
            </p>
          </div>
        )}

        {stage === 'processing' && (
          <div className="py-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-navy-200 border-t-navy-700 animate-spin" />
            <p className="mt-4 text-navy-600 font-medium">Processing payment…</p>
          </div>
        )}

        {stage === 'done' && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-success-50 border border-success-200 text-success-800">
              <p className="font-semibold">✓ {amt} EGP charged to •••• {last4 || '0000'}</p>
              <p className="text-sm mt-1">The amount is now held safely in escrow.</p>
            </div>

            <FlowStepper seekerName={seekerName} />

            <p className="text-xs text-navy-400">
              Once you mark the job complete, Shagalny releases the funds to {seekerName}&apos;s payout card.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}

function FlowStepper() {
  const steps = [
    { t: 'Company paid', d: 'Card charged', done: true },
    { t: 'Held in escrow', d: 'Shagalny is securing the funds', done: true, active: true },
    { t: 'Released to worker', d: 'After the job is completed', done: false },
  ];
  return (
    <ol className="relative border-l-2 border-navy-100 ml-2 space-y-5">
      {steps.map((s, i) => (
        <li key={i} className="ml-4">
          <span
            className={`absolute -left-[9px] w-4 h-4 rounded-full border-2 ${
              s.done ? 'bg-success-500 border-success-500' : 'bg-white border-navy-300'
            }`}
          />
          <p className={`text-sm font-semibold ${s.active ? 'text-navy-900' : 'text-navy-700'}`}>{s.t}</p>
          <p className="text-xs text-navy-500">{s.d}</p>
        </li>
      ))}
    </ol>
  );
}

import { useState } from 'react';
import Modal from './Modal';

// Reusable star + comment rating modal.
// Props: open, onClose, title, subjectLabel, onSubmit(rating, comment)
export default function RateModal({ open, onClose, title = 'Leave a rating', subjectLabel, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function close() {
    setRating(0); setHover(0); setComment(''); setSubmitting(false);
    onClose?.();
  }

  async function submit() {
    if (!rating) return;
    setSubmitting(true);
    try {
      await onSubmit?.(rating, comment);
      setRating(0); setHover(0); setComment('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      footer={<>
        <button onClick={close} className="btn-ghost text-sm">Cancel</button>
        <button onClick={submit} disabled={!rating || submitting} className="btn-accent text-sm disabled:opacity-60 disabled:cursor-not-allowed">
          {submitting ? 'Submitting...' : 'Submit rating'}
        </button>
      </>}
    >
      {subjectLabel && <p className="text-sm text-navy-600 mb-4">{subjectLabel}</p>}

      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className="text-3xl leading-none"
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            <span className={(hover || rating) >= n ? 'text-amber-400' : 'text-navy-200'}>★</span>
          </button>
        ))}
        <span className="ml-2 text-sm text-navy-500">{rating ? `${rating}/5` : 'Tap to rate'}</span>
      </div>

      <textarea
        className="input min-h-[90px]"
        placeholder="Share a few words about your experience (optional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
    </Modal>
  );
}

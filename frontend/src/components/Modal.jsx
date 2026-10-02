import { useEffect } from 'react';

// Modal — accessible overlay dialog with backdrop and Esc-to-close.
export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-2xl shadow-soft w-full ${widths[size]} overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <header className="px-6 py-4 border-b border-navy-100 flex items-center justify-between">
            <h3 className="font-semibold text-navy-900">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 grid place-items-center rounded-lg hover:bg-navy-50 text-navy-500"
              aria-label="Close"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </header>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <footer className="px-6 py-4 border-t border-navy-100 flex justify-end gap-2 bg-navy-50/40">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

// VerificationBadge — shows verified / pending / unverified status with color.
export default function VerificationBadge({ status = 'verified', size = 'sm' }) {
  const config = {
    verified: {
      label: 'Verified',
      classes: 'bg-success-50 text-success-700 border-success-200',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    pending: {
      label: 'Pending',
      classes: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .2.08.39.22.53l3 3a.75.75 0 1 0 1.06-1.06L10.75 9.69V5Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    unverified: {
      label: 'Unverified',
      classes: 'bg-red-50 text-red-700 border-red-200',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  };
  const c = config[status] || config.unverified;
  const sizeClasses = size === 'md' ? 'text-sm px-3 py-1' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${c.classes} ${sizeClasses}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

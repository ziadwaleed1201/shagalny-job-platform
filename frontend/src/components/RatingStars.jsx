// RatingStars — displays a star rating out of 5 with an optional numeric label.
export default function RatingStars({ rating = 0, showNumber = true, size = 'sm' }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const sizeClass = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex">
        {[0, 1, 2, 3, 4].map((i) => {
          const filled = i < full;
          const half = i === full && hasHalf;
          return (
            <svg
              key={i}
              className={`${sizeClass} ${filled || half ? 'text-amber-400' : 'text-navy-100'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              {half ? (
                <defs>
                  <linearGradient id={`half-${i}`}>
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="#d8e2f1" />
                  </linearGradient>
                </defs>
              ) : null}
              <path
                fill={half ? `url(#half-${i})` : 'currentColor'}
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
              />
            </svg>
          );
        })}
      </span>
      {showNumber && <span className="text-xs font-semibold text-navy-700">{rating.toFixed(1)}</span>}
    </span>
  );
}

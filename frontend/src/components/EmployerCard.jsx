import VerificationBadge from './VerificationBadge';
import RatingStars from './RatingStars';

// EmployerCard — compact card showing employer summary info.
export default function EmployerCard({ employer }) {
  return (
    <article className="card p-5 flex items-center gap-4">
      <div className="w-14 h-14 rounded-xl bg-navy-700 text-white grid place-items-center font-bold text-lg shrink-0">
        {employer.logo}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-navy-900 truncate">{employer.companyName}</h4>
        <p className="text-sm text-navy-500">{employer.industry} · {employer.location}</p>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <VerificationBadge status={employer.verificationStatus} />
          <RatingStars rating={employer.rating} />
        </div>
      </div>
    </article>
  );
}

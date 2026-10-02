import { Link } from 'react-router-dom';
import VerificationBadge from './VerificationBadge';
import RatingStars from './RatingStars';

// JobCard — used in job listings, recommended jobs, and saved jobs.
export default function JobCard({ job, saved = false, applied = false, onSave, onApply }) {
  return (
    <article className="card p-5 flex flex-col gap-4 hover:shadow-soft transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link to={`/jobs/${job.id}`} className="block">
            <h3 className="text-lg font-semibold text-navy-900 hover:text-navy-700 transition truncate">
              {job.title}
            </h3>
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-navy-500">
            <span className="font-medium text-navy-700">{job.companyName}</span>
            {job.isVerified && <VerificationBadge status="verified" />}
            <RatingStars rating={job.rating} />
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onSave?.(job.id);
          }}
          aria-label={saved ? 'Unsave job' : 'Save job'}
          className={`shrink-0 w-10 h-10 rounded-lg grid place-items-center transition ${
            saved ? 'bg-accent-50 text-accent-600' : 'bg-navy-50 text-navy-400 hover:text-accent-500 hover:bg-accent-50'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3-7 3V5Z" />
          </svg>
        </button>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <Meta icon="💰" label="Salary" value={`${job.salary} EGP / ${job.salaryUnit}`} />
        <Meta icon="📍" label="Location" value={job.location} />
        <Meta icon="📅" label="Shift" value={job.shiftDate} />
        <Meta icon="⏰" label="Hours" value={`${job.duration}h · ${job.shiftTime}`} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="chip bg-navy-50 text-navy-700">{job.jobType}</span>
        {job.tags?.slice(0, 3).map((t) => (
          <span key={t} className="chip bg-accent-50 text-accent-600">{t}</span>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-navy-100">
        <Link to={`/jobs/${job.id}`} className="btn-outline text-sm flex-1 sm:flex-none">
          View Details
        </Link>
        {applied ? (
          <button
            disabled
            className="btn-outline text-sm flex-1 sm:flex-none cursor-default text-success-700 border-success-200 bg-success-50"
          >
            ✓ Applied
          </button>
        ) : (
          <button
            onClick={() => onApply?.(job.id)}
            className="btn-accent text-sm flex-1 sm:flex-none"
          >
            Apply Now
          </button>
        )}
        <span className="ml-auto text-xs text-navy-400">{job.applicants} applicants</span>
      </div>
    </article>
  );
}

function Meta({ icon, label, value }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-navy-400 font-medium">
        <span className="mr-1">{icon}</span>
        {label}
      </div>
      <div className="text-sm font-medium text-navy-800 truncate">{value}</div>
    </div>
  );
}

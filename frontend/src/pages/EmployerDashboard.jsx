import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardCard from '../components/DashboardCard';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import VerificationBadge from '../components/VerificationBadge';
import ApplicationStatusBadge from '../components/ApplicationStatusBadge';
import RatingStars from '../components/RatingStars';
import { SkeletonRows, EmptyState } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { Jobs, Applications, Employers, Reviews } from '../lib/api';
import PaySeekerButton from '../components/PaySeekerButton';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [section, setSection] = useState('overview');
  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    Promise.all([
      Employers.me().catch(() => null),
      Jobs.mine().catch(() => []),
      Applications.forEmployer().catch(() => []),
    ]).then(([e, j, a]) => {
      if (cancel) return;
      setEmployer(e); setJobs(j); setApps(a);
    }).finally(() => !cancel && setLoading(false));
    return () => { cancel = true; };
  }, []);

  const byStatus = (s) => apps.filter((a) => a.status === s);
  const items = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'jobs', label: 'My Job Posts', icon: '📋', count: jobs.length },
    { id: 'applicants', label: 'Applicants', icon: '👥', count: byStatus('applied').length },
    { id: 'shortlist', label: 'Shortlisted', icon: '⭐', count: byStatus('shortlisted').length },
    { id: 'hired', label: 'Hired Workers', icon: '✓', count: byStatus('hired').length },
    { id: 'completed', label: 'Completed Workers', icon: '🏅', count: byStatus('completed').length },
  ];

  async function setStatus(appId, status) {
    try {
      const updated = await Applications.updateStatus(appId, status);
      setApps(apps.map((a) => a._id === appId ? { ...a, status: updated.status } : a));
      toast.success(`Marked as ${status}`);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Update failed.');
    }
  }

  const totalViews = jobs.reduce((s, j) => s + (j.viewsCount || 0), 0);

  return (
    <div>
      <Navbar />
      <div className="section py-8 animate-fade-in">
        <header className="flex flex-col md:flex-row md:items-center gap-4 justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-navy-700 text-white grid place-items-center text-lg font-bold">
              {employer?.logo || (employer?.companyName?.charAt(0) || 'E')}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{employer?.companyName || 'Employer'}</h1>
              <div className="text-navy-500 text-sm flex items-center gap-2 flex-wrap">
                {employer?.industry} · {employer?.location}
                {employer && <VerificationBadge status={employer.verificationStatus} />}
                {employer && <RatingStars rating={employer.rating} />}
              </div>
            </div>
          </div>
          <Link to="/post-job" className="btn-accent">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
            Post a New Job
          </Link>
        </header>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          <aside className="card p-3 lg:sticky lg:top-20 lg:h-fit">
            <div className="px-2 pb-2 mb-2 border-b border-navy-100">
              <p className="text-xs uppercase tracking-wider text-navy-400 font-semibold">Employer</p>
            </div>
            <nav className="flex flex-col gap-1">
              {items.map((it) => {
                const active = section === it.id;
                return (
                  <button key={it.id} onClick={() => setSection(it.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition text-left ${
                      active ? 'bg-navy-50 text-navy-900 font-semibold' : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
                    }`}>
                    <span className="w-5 text-center">{it.icon}</span>
                    <span className="flex-1">{it.label}</span>
                    {it.count != null && it.count > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-md bg-navy-100 text-navy-700 font-semibold">{it.count}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="space-y-6">
            {section === 'overview' && (
              <>
                {employer && employer.verificationStatus !== 'verified' && (
                  <div className="rounded-2xl p-5 bg-amber-50 border border-amber-200 flex items-center gap-4 animate-slide-up">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 grid place-items-center">⚠</div>
                    <div className="flex-1">
                      <p className="font-semibold text-amber-900">Complete your business verification</p>
                      <p className="text-sm text-amber-800">Your jobs won't appear publicly until our admin team verifies your business documents.</p>
                    </div>
                    <button className="btn-primary text-sm">Verify now</button>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon="👁" value={totalViews.toLocaleString()} label="Total job views" accent="navy" />
                  <StatCard icon="📨" value={apps.length} label="Applications" accent="accent" />
                  <StatCard icon="✓" value={byStatus('hired').length} label="Successful hires" accent="success" />
                  <StatCard icon="⭐" value={(employer?.rating || 0).toFixed(1)} label="Average rating" accent="amber" />
                </div>

                <DashboardCard title="Active Job Posts"
                  action={<Link to="/post-job" className="text-sm font-medium text-accent-600 hover:text-accent-700">+ Post job</Link>}>
                  {loading ? <SkeletonRows /> : jobs.length === 0 ? (
                    <EmptyState icon="📋" title="No active job posts."
                      action={<Link to="/post-job" className="btn-primary text-sm">Post your first job</Link>} />
                  ) : (
                    <ul className="divide-y divide-navy-100">
                      {jobs.map((j) => (
                        <li key={j._id} className="py-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-navy-900">{j.title}</p>
                            <p className="text-sm text-navy-500">
                              {j.location} · {new Date(j.shiftDate).toLocaleDateString()} · {j.salary} EGP/{j.salaryUnit}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-navy-600">{j.applicantsCount} applicants</span>
                            <Link to={`/jobs/${j._id}`} className="btn-outline text-xs">View</Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </DashboardCard>
              </>
            )}

            {section === 'jobs' && (
              <DashboardCard title={`My Job Posts (${jobs.length})`}
                action={<Link to="/post-job" className="btn-accent text-sm">+ New Job</Link>}>
                {jobs.length === 0 ? <EmptyState icon="📋" title="No job posts yet." /> : (
                  <div className="overflow-x-auto -mx-5">
                    <table className="w-full text-sm">
                      <thead className="bg-navy-50/60 text-navy-500 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="text-left px-5 py-3">Title</th>
                          <th className="text-left px-5 py-3">Shift</th>
                          <th className="text-left px-5 py-3">Applicants</th>
                          <th className="text-left px-5 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((j) => (
                          <tr key={j._id} className="border-t border-navy-100">
                            <td className="px-5 py-3 font-medium text-navy-900">{j.title}</td>
                            <td className="px-5 py-3 text-navy-600">{new Date(j.shiftDate).toLocaleDateString()} · {j.shiftTime}</td>
                            <td className="px-5 py-3">{j.applicantsCount}</td>
                            <td className="px-5 py-3">
                              <span className={`chip ${j.status === 'open' ? 'bg-success-50 text-success-700' : 'bg-amber-50 text-amber-700'}`}>
                                {j.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </DashboardCard>
            )}

            {section === 'applicants' && <ApplicantList label="New Applicants" rows={byStatus('applied')} onAction={setStatus} actions={['shortlist','reject']} />}
            {section === 'shortlist' && <ApplicantList label="Shortlisted Candidates" rows={byStatus('shortlisted')} onAction={setStatus} actions={['hire','reject']} />}
            {section === 'hired' && <ApplicantList label="Hired Workers" rows={byStatus('hired')} onAction={setStatus} actions={['completed']} />}
            {section === 'completed' && <ApplicantList label="Completed Workers" rows={byStatus('completed')} onAction={setStatus} actions={['rate']} />}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ApplicantList({ label, rows, onAction, actions = [] }) {
  const [selected, setSelected] = useState(null);
  const [ratingApp, setRatingApp] = useState(null);
  const [rated, setRated] = useState(new Set());

  if (!rows.length) {
    return <DashboardCard title={label}><EmptyState icon="👥" title="No candidates in this stage yet." /></DashboardCard>;
  }
  return (
    <DashboardCard title={`${label} (${rows.length})`}>
      <ul className="divide-y divide-navy-100">
        {rows.map((a) => (
          <li key={a._id} className="py-4 flex flex-wrap items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-navy-700 text-white grid place-items-center font-bold shrink-0">
              {a.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-navy-900">{a.user?.name}</p>
              <p className="text-sm text-navy-500 truncate">
                Applied for <span className="font-medium text-navy-700">{a.job?.title}</span>
              </p>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <RatingStars rating={a.user?.rating || 0} />
                {a.user && <VerificationBadge status={a.user.verificationStatus} />}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <ApplicationStatusBadge status={a.status} />
              <button onClick={() => setSelected(a)} className="btn-outline text-xs">View profile</button>
              {actions.includes('shortlist') && <button onClick={() => onAction(a._id, 'shortlisted')} className="btn-outline text-xs">Shortlist</button>}
              {actions.includes('hire') && <button onClick={() => onAction(a._id, 'hired')} className="btn-success text-xs">Hire</button>}
              {actions.includes('completed') && <button onClick={() => onAction(a._id, 'completed')} className="btn-outline text-xs">Mark complete</button>}
              {actions.includes('completed') && <PaySeekerButton application={a} />}
              {actions.includes('completed') && !rated.has(a._id) && (
                <button onClick={() => setRatingApp(a)} className="btn-outline text-xs">⭐ Rate</button>
              )}
              {actions.includes('completed') && rated.has(a._id) && (
                <span className="text-xs text-success-700 font-medium">Rated ✓</span>
              )}
              {actions.includes('rate') && <PaySeekerButton application={a} />}
              {actions.includes('rate') && !rated.has(a._id) && (
                <button onClick={() => setRatingApp(a)} className="btn-outline text-xs">⭐ Rate</button>
              )}
              {actions.includes('rate') && rated.has(a._id) && (
                <span className="text-xs text-success-700 font-medium">Rated ✓</span>
              )}
              {actions.includes('reject') && <button onClick={() => onAction(a._id, 'rejected')} className="text-xs text-red-600 hover:text-red-700 px-3 py-2">Reject</button>}
            </div>
          </li>
        ))}
      </ul>

      {/* Applicant profile viewer */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Applicant profile" size="lg">
        {selected && <SeekerProfile app={selected} />}
      </Modal>

      {/* Rate seeker modal */}
      <RateModal
        open={!!ratingApp}
        onClose={() => setRatingApp(null)}
        title={`Rate ${ratingApp?.user?.name || 'Worker'}`}
        applicationId={ratingApp?._id}
        onSuccess={() => {
          setRated((prev) => new Set([...prev, ratingApp._id]));
          setRatingApp(null);
        }}
      />
    </DashboardCard>
  );
}

// Reusable rating submission modal.
function RateModal({ open, onClose, title, applicationId, onSuccess }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!stars) return toast.error('Please select a star rating.');
    setSubmitting(true);
    try {
      await Reviews.create({ applicationId, rating: stars, comment });
      toast.success('Rating submitted!');
      setStars(0); setComment('');
      onSuccess?.();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not submit rating.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-outline text-sm">Cancel</button>
          <button onClick={submit} disabled={submitting || !stars} className="btn-primary text-sm disabled:opacity-50">
            {submitting ? 'Submitting…' : 'Submit Rating'}
          </button>
        </>
      }>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-navy-600 mb-2">How would you rate this worker?</p>
          <div className="flex gap-1">
            {[1,2,3,4,5].map((s) => (
              <button key={s}
                onClick={() => setStars(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                className="text-3xl transition-transform hover:scale-110"
              >
                <span className={(hover || stars) >= s ? 'text-amber-400' : 'text-navy-200'}>★</span>
              </button>
            ))}
          </div>
          {stars > 0 && (
            <p className="text-xs text-navy-500 mt-1">
              {['','Poor','Fair','Good','Very good','Excellent'][stars]}
            </p>
          )}
        </div>
        <div>
          <p className="text-sm text-navy-600 mb-1">Comment (optional)</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your experience…"
            className="w-full border border-navy-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}

function SeekerProfile({ app }) {
  const js = app.jobSeeker || {};
  const name = app.user?.name || js.user?.fullName || 'Applicant';
  const email = js.user?.email || '';
  const rating = Number(app.user?.rating ?? js.rating ?? 0);
  const skills = js.skills || [];
  const hasDetails = js.about || skills.length > 0 || js.cv;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        {js.photo ? (
          <img src={js.photo} alt="" className="w-16 h-16 rounded-2xl object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-navy-700 text-white grid place-items-center text-xl font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-lg font-bold text-navy-900">{name}</p>
          <div className="mt-1"><RatingStars rating={rating} /></div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        {email && (
          <div>
            <p className="text-xs uppercase tracking-wider text-navy-400 font-semibold">Email</p>
            <p className="text-navy-800 break-words">{email}</p>
          </div>
        )}
        <div>
          <p className="text-xs uppercase tracking-wider text-navy-400 font-semibold">Applied for</p>
          <p className="text-navy-800">{app.job?.title || '—'}</p>
        </div>
      </div>

      {js.about && (
        <div>
          <p className="text-xs uppercase tracking-wider text-navy-400 font-semibold mb-1">About</p>
          <p className="text-sm text-navy-700 whitespace-pre-wrap">{js.about}</p>
        </div>
      )}

      {skills.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-navy-400 font-semibold mb-1">Skills</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((sk, i) => <span key={i} className="chip bg-navy-50 text-navy-700">{sk}</span>)}
          </div>
        </div>
      )}

      {js.cv && (
        <a href={js.cv} download={js.cvName || 'cv'} className="btn-outline text-xs inline-block">
          ⬇ Download CV{js.cvName ? ` (${js.cvName})` : ''}
        </a>
      )}

      {!hasDetails && (
        <p className="text-sm text-navy-500">This applicant hasn't filled in their profile details yet.</p>
      )}
    </div>
  );
}

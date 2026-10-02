import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VerificationBadge from '../components/VerificationBadge';
import RatingStars from '../components/RatingStars';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { Jobs, Applications, SavedJobs, Reviews } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [saved, setSaved] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    Jobs.get(id)
      .then((data) => {
        if (cancel) return;
        setJob(data);
        if (data.employer?._id) Reviews.forEmployer(data.employer._id).then((rs) => !cancel && setReviews(rs)).catch(() => {});
      })
      .catch(() => toast.error('Job not found.'))
      .finally(() => !cancel && setLoading(false));
    if (user) SavedJobs.list().then((list) => !cancel && setSaved(list.some((j) => j._id === id))).catch(() => {});
    return () => { cancel = true; };
  }, [id, user]);

  async function submitApplication() {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'seeker') { toast.error('Only job seekers can apply.'); return; }
    try {
      await Applications.apply(id, coverNote);
      toast.success('Application sent!');
      setApplied(true);
      setShowApply(false);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not apply.');
    }
  }

  async function submitReport() {
    if (!user) { navigate('/login'); return; }
    try {
      await Jobs.report(id, reportReason);
      toast.success('Report submitted. Admin will review within 24h.');
      setShowReport(false);
      setReportReason('');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not submit report.');
    }
  }

  async function toggleSave() {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await SavedJobs.toggle(id);
      setSaved(res.saved);
      toast.success(res.saved ? 'Job saved' : 'Removed from saved');
    } catch {}
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="section py-8 max-w-4xl">
          <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-navy-100 rounded-2xl" />
            <div className="h-48 bg-navy-100 rounded-2xl" />
            <div className="h-48 bg-navy-100 rounded-2xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div>
        <Navbar />
        <div className="section py-20 text-center">
          <h1 className="text-2xl font-bold">Job not found</h1>
          <p className="text-navy-500 mt-2">This job may have been removed.</p>
          <Link to="/jobs" className="btn-primary mt-6 inline-flex text-sm">Back to jobs</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const employer = job.employer || {};
  const shiftDateFmt = job.shiftDate ? new Date(job.shiftDate).toLocaleDateString('en-CA') : '';

  return (
    <div>
      <Navbar />
      <div className="section py-8 animate-fade-in">
        <nav className="text-sm text-navy-500 mb-5">
          <Link to="/jobs" className="hover:text-navy-700">Jobs</Link>
          <span className="mx-2">/</span>
          <span className="text-navy-700">{job.title}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-6">
            <header className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="chip bg-navy-50 text-navy-700">{job.jobType}</span>
                    {employer.verificationStatus === 'verified' && <VerificationBadge status="verified" />}
                  </div>
                  <h1 className="text-3xl font-extrabold">{job.title}</h1>
                  <div className="mt-2 flex items-center gap-2 flex-wrap text-navy-600">
                    <span className="font-medium">{employer.companyName || 'Employer'}</span>
                    <span>·</span><span>{job.location}</span>
                    <span>·</span><RatingStars rating={employer.rating || 0} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-accent-600">{job.salary} EGP</p>
                  <p className="text-xs text-navy-500">per {job.salaryUnit}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-navy-100">
                <Meta label="Date" value={shiftDateFmt} icon="📅" />
                <Meta label="Time" value={job.shiftTime} icon="⏰" />
                <Meta label="Duration" value={`${job.duration} hours`} icon="⌛" />
                <Meta label="Workers needed" value={job.workersNeeded} icon="👥" />
              </div>
            </header>

            <section className="card p-6">
              <h2 className="text-lg font-bold mb-3">Job Description</h2>
              <p className="text-navy-700 leading-relaxed whitespace-pre-line">{job.description}</p>
            </section>

            <section className="card p-6">
              <h2 className="text-lg font-bold mb-3">Requirements</h2>
              <ul className="space-y-2">
                {(job.requirements || []).map((r, i) => (
                  <li key={i} className="flex gap-2 text-navy-700">
                    <span className="text-success-600 mt-1">✓</span><span>{r}</span>
                  </li>
                ))}
              </ul>
            </section>

            {job.instructions && (
              <section className="card p-6 bg-accent-50/40 border-accent-100">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-accent-500">📋</span> Instructions & Training
                </h2>
                <p className="text-navy-700 leading-relaxed whitespace-pre-line">{job.instructions}</p>
              </section>
            )}

            <section className="card p-6">
              <h2 className="text-lg font-bold mb-3">Location</h2>
              <p className="text-navy-600 mb-3">{job.location}, {job.city}</p>
              {(() => {
                const hasCoords = job.latitude != null && job.longitude != null;
                const q = hasCoords
                  ? `${job.latitude},${job.longitude}`
                  : [job.location, job.city].filter(Boolean).join(', ');
                const embed = `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
                const link = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
                return (
                  <>
                    <div className="rounded-xl overflow-hidden h-56 border border-navy-100">
                      <iframe
                        title="Job location"
                        src={embed}
                        className="w-full h-full"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                      />
                    </div>
                    <a href={link} target="_blank" rel="noreferrer" className="btn-outline text-sm mt-3 inline-flex">
                      📍 Open in Google Maps
                    </a>
                  </>
                );
              })()}
            </section>

            <section className="card p-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-bold">About the employer</h2>
                <VerificationBadge status={employer.verificationStatus || 'unverified'} />
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-navy-700 text-white grid place-items-center font-bold">{employer.logo || 'E'}</div>
                <div>
                  <p className="font-semibold text-navy-900">{employer.companyName}</p>
                  <p className="text-sm text-navy-500">{employer.industry} · {employer.employeeCount || ''}</p>
                  <RatingStars rating={employer.rating || 0} />
                </div>
              </div>
              {employer.description && <p className="mt-4 text-navy-700">{employer.description}</p>}

              <div className="mt-6 pt-6 border-t border-navy-100">
                <h3 className="font-semibold mb-3">Employer reviews ({reviews.length})</h3>
                {reviews.length === 0 ? (
                  <p className="text-sm text-navy-500">No reviews yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {reviews.map((r) => (
                      <li key={r._id} className="p-3 rounded-xl bg-navy-50/50 border border-navy-100">
                        <RatingStars rating={r.rating} />
                        <p className="mt-1 text-sm text-navy-700">"{r.comment}"</p>
                        <p className="text-xs text-navy-400 mt-1">{r.fromUser?.name || 'Worker'} · {new Date(r.createdAt).toLocaleDateString()}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-20 lg:h-fit space-y-4">
            <div className="card p-5 space-y-3">
              {applied ? (
                <div className="p-4 rounded-xl bg-success-50 text-success-700 border border-success-200 animate-fade-in">
                  <p className="font-semibold">✓ Application sent</p>
                  <p className="text-sm mt-1">Check your dashboard for status updates.</p>
                </div>
              ) : (
                <button onClick={() => user ? setShowApply(true) : navigate('/login')} className="btn-accent w-full">Apply Now</button>
              )}
              <button onClick={toggleSave} className={`btn-outline w-full ${saved ? 'bg-navy-50' : ''}`}>
                {saved ? '★ Saved' : '☆ Save Job'}
              </button>
              <button onClick={() => user ? setShowReport(true) : navigate('/login')}
                className="w-full text-sm text-red-600 hover:text-red-700 py-2 font-medium">
                ⚠ Report suspicious job
              </button>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-navy-500">Quick facts</h3>
              <ul className="space-y-2 text-sm">
                <FactRow label="Pay" value={`${job.salary} EGP / ${job.salaryUnit}`} />
                <FactRow label="Applicants" value={job.applicantsCount || 0} />
                <FactRow label="Views" value={job.viewsCount || 0} />
                <FactRow label="Contact" value={job.contactMethod} />
              </ul>
            </div>

            <div className="card p-5 bg-navy-900 text-white">
              <p className="font-semibold">Safety reminder</p>
              <p className="text-sm text-navy-200 mt-1">
                Never pay an employer to apply. All payments on Shagalny flow from employer to worker — never the other way.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <Modal open={showApply} onClose={() => setShowApply(false)} title="Apply for this job"
        footer={<>
          <button onClick={() => setShowApply(false)} className="btn-ghost text-sm">Cancel</button>
          <button onClick={submitApplication} className="btn-accent text-sm">Send application</button>
        </>}>
        <p className="text-sm text-navy-600 mb-4">
          You're applying to <strong className="text-navy-900">{job.title}</strong> at {employer.companyName}.
        </p>
        <FormInput as="textarea" label="Short message to the employer (optional)"
          placeholder="Why are you a good fit? Any availability notes?"
          value={coverNote} onChange={(e) => setCoverNote(e.target.value)}
          hint="A friendly note helps you stand out." />
      </Modal>

      <Modal open={showReport} onClose={() => setShowReport(false)} title="Report this job"
        footer={<>
          <button onClick={() => setShowReport(false)} className="btn-ghost text-sm">Cancel</button>
          <button onClick={submitReport} disabled={!reportReason.trim()}
            className="btn-primary text-sm bg-red-600 hover:bg-red-700">Submit report</button>
        </>}>
        <FormInput as="select" label="Reason"
          options={[
            { value: '', label: 'Select a reason...' },
            { value: 'Looks like a fake job', label: 'Looks like a fake job' },
            { value: 'Unsafe working conditions', label: 'Unsafe working conditions' },
            { value: 'Pay or hours not as described', label: 'Pay or hours not as described' },
            { value: 'Asking for payment from workers', label: 'Asking for payment from workers' },
            { value: 'Other', label: 'Other' },
          ]}
          value={reportReason} onChange={(e) => setReportReason(e.target.value)} />
      </Modal>

      <Footer />
    </div>
  );
}

function Meta({ label, value, icon }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-navy-400 font-medium"><span className="mr-1">{icon}</span>{label}</div>
      <div className="text-sm font-semibold text-navy-900 truncate">{value}</div>
    </div>
  );
}

function FactRow({ label, value }) {
  return (
    <li className="flex justify-between">
      <span className="text-navy-500">{label}</span>
      <span className="font-medium text-navy-900">{value}</span>
    </li>
  );
}

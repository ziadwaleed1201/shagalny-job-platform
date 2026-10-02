import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardCard from '../components/DashboardCard';
import StatCard from '../components/StatCard';
import JobCard from '../components/JobCard';
import ApplicationStatusBadge from '../components/ApplicationStatusBadge';
import VerificationBadge from '../components/VerificationBadge';
import RatingStars from '../components/RatingStars';
import Modal from '../components/Modal';
import { SkeletonRows, EmptyState } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { Applications, SavedJobs, Notifications, Reviews, Jobs, Profile } from '../lib/api';
import { normalizeJob } from './JobListing';

export default function JobSeekerDashboard() {
  const { user, refreshMe } = useAuth();
  const [section, setSection] = useState('overview');
  const [apps, setApps] = useState([]);
  const [saved, setSaved] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  const [seekerProfile, setSeekerProfile] = useState(null);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    Promise.all([
      Applications.mine().catch(() => []),
      SavedJobs.list().catch(() => []),
      Notifications.mine().catch(() => []),
      Reviews.forUser(user._id).catch(() => []),
      Jobs.list({ sort: 'recent' }).catch(() => []),
      Profile.get().catch(() => null),
    ]).then(([a, s, n, r, j, p]) => {
      if (cancel) return;
      setApps(a); setSaved(s); setNotifs(n); setReviews(r);
      setSeekerProfile(p);
      const appliedIds = new Set(a.map((x) => x.job?._id));
      setRecommended(j.filter((x) => !appliedIds.has(x._id)).slice(0, 4));
    }).finally(() => !cancel && setLoading(false));
    refreshMe();
    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upcoming = apps.filter((a) => a.status === 'hired');
  const history = apps.filter((a) => ['completed', 'rejected'].includes(a.status));
  const unread = notifs.filter((n) => !n.read).length;

  const items = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'applications', label: 'My Applications', icon: '📨', count: apps.length },
    { id: 'saved', label: 'Saved Jobs', icon: '🔖', count: saved.length },
    { id: 'shifts', label: 'Upcoming Shifts', icon: '📅', count: upcoming.length },
    { id: 'history', label: 'Job History', icon: '🕐', count: history.length },
    { id: 'reviews', label: 'My Ratings', icon: '⭐' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', count: unread },
  ];

  return (
    <div>
      <Navbar />
      <div className="section py-8 animate-fade-in">
        <header className="flex flex-col md:flex-row md:items-center gap-4 justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-navy-700 text-white grid place-items-center text-lg font-bold">
              {user.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">Hi, {user.fullName?.split(' ')[0]} 👋</h1>
              <div className="text-navy-500 text-sm flex items-center gap-2 flex-wrap">
                {user.city || 'Cairo'} <VerificationBadge status={user.accountStatus === 'active' ? 'verified' : 'pending'} />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/jobs" className="btn-outline text-sm">Browse Jobs</Link>
            <Link to="/support" className="btn-ghost text-sm">Get Help</Link>
          </div>
        </header>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          <Sidebar items={items} section={section} setSection={setSection} title="My Dashboard" />

          <div className="space-y-6">
            {section === 'overview' && (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon="📨" value={apps.length} label="Applications" accent="navy" />
                  <StatCard icon="📅" value={upcoming.length} label="Upcoming shifts" accent="accent" />
                  <StatCard icon="✓" value={user.completedShifts || 0} label="Shifts completed" accent="success" />
                  <StatCard icon="⭐" value={(user.rating || 0).toFixed(1)} label="Your rating" accent="amber" />
                </div>

                <DashboardCard title="Profile Completion"
                  action={<button onClick={() => setSection('profile')} className="text-xs text-accent-600 hover:underline">Edit profile</button>}>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      {(() => {
                        const p = seekerProfile;
                        const checks = [
                          !!p?.photo,
                          !!p?.about,
                          (p?.skills?.length || 0) > 0,
                          !!p?.cv,
                          !!user?.fullName,
                        ];
                        const done = checks.filter(Boolean).length;
                        const pct = Math.round((done / checks.length) * 100);
                        const missing = [
                          !p?.photo && 'Profile photo',
                          !p?.about && 'About / experience',
                          !(p?.skills?.length) && 'Skills',
                          !p?.cv && 'CV upload',
                        ].filter(Boolean);
                        return (
                          <>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium text-navy-700">{pct}% complete</span>
                              {missing.length > 0 && (
                                <span className="text-navy-400">Missing: {missing[0]}{missing.length > 1 ? ` +${missing.length - 1}` : ''}</span>
                              )}
                            </div>
                            <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-navy-700 to-accent-500 transition-all duration-500"
                                style={{ width: `${pct}%` }} />
                            </div>
                            {pct === 100 && (
                              <p className="text-xs text-success-700 mt-1 font-medium">✓ Profile complete — companies can see everything!</p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </DashboardCard>

                <DashboardCard title="Recommended for you"
                  action={<Link to="/jobs" className="text-sm font-medium text-navy-700 hover:text-navy-900">See all</Link>}>
                  {loading ? <SkeletonRows count={2} /> : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {recommended.slice(0, 2).map((j) => <JobCard key={j._id} job={normalizeJob(j)} />)}
                    </div>
                  )}
                </DashboardCard>
              </>
            )}

            {section === 'profile' && <ProfileSection />}

            {section === 'applications' && (
              <DashboardCard title={`My Applications (${apps.length})`}>
                {loading ? <SkeletonRows /> : apps.length === 0 ? (
                  <EmptyState icon="📭" title="No applications yet"
                    subtitle="Apply to your first job to see it here."
                    action={<Link to="/jobs" className="btn-primary text-sm">Browse jobs</Link>} />
                ) : (
                  <div className="overflow-x-auto -mx-5">
                    <table className="w-full text-sm">
                      <thead className="bg-navy-50/60 text-navy-500 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="text-left px-5 py-3">Job</th>
                          <th className="text-left px-5 py-3">Company</th>
                          <th className="text-left px-5 py-3">Applied</th>
                          <th className="text-left px-5 py-3">Status</th>
                          <th className="text-right px-5 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {apps.map((a) => (
                          <tr key={a._id} className="border-t border-navy-100 hover:bg-navy-50/30">
                            <td className="px-5 py-3 font-medium text-navy-900">{a.job?.title || '—'}</td>
                            <td className="px-5 py-3 text-navy-600">{a.job?.employer?.companyName || '—'}</td>
                            <td className="px-5 py-3 text-navy-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                            <td className="px-5 py-3"><ApplicationStatusBadge status={a.status} /></td>
                            <td className="px-5 py-3 text-right">
                              {a.job && <Link to={`/jobs/${a.job._id}`} className="text-navy-700 font-medium hover:underline text-sm">View</Link>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </DashboardCard>
            )}

            {section === 'saved' && (
              <DashboardCard title={`Saved Jobs (${saved.length})`}>
                {loading ? <SkeletonRows /> : saved.length === 0 ? (
                  <EmptyState icon="🔖" title="No saved jobs yet" subtitle="Tap the bookmark on any job to save it."
                    action={<Link to="/jobs" className="btn-primary text-sm">Find jobs</Link>} />
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {saved.map((j) => <JobCard key={j._id} job={normalizeJob(j)} saved />)}
                  </div>
                )}
              </DashboardCard>
            )}

            {section === 'shifts' && (
              <DashboardCard title={`Upcoming Shifts (${upcoming.length})`}>
                {upcoming.length === 0 ? (
                  <EmptyState icon="📅" title="No confirmed shifts yet."
                    action={<Link to="/jobs" className="btn-primary text-sm">Apply for shifts</Link>} />
                ) : (
                  <ul className="divide-y divide-navy-100">
                    {upcoming.map((a) => (
                      <li key={a._id} className="py-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-navy-900">{a.job?.title}</p>
                          <p className="text-sm text-navy-500">{a.job?.employer?.companyName} · {a.job?.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-navy-900 text-sm">{a.job?.shiftDate ? new Date(a.job.shiftDate).toLocaleDateString() : ''}</p>
                          <p className="text-xs text-navy-500">{a.job?.shiftTime}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </DashboardCard>
            )}

            {section === 'history' && <HistorySection history={history} />}

            {section === 'reviews' && (
              <DashboardCard title={`Your Rating: ${(user.rating || 0).toFixed(1)}`}
                action={<RatingStars rating={user.rating || 0} size="md" />}>
                {reviews.length === 0 ? <EmptyState icon="⭐" title="No reviews yet" subtitle="Complete a shift to earn your first rating." /> : (
                  <ul className="space-y-4">
                    {reviews.map((r) => (
                      <li key={r._id} className="p-4 rounded-xl bg-navy-50/50 border border-navy-100">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-navy-900">From {r.fromUser?.name || 'Employer'}</p>
                          <RatingStars rating={r.rating} />
                        </div>
                        <p className="mt-2 text-sm text-navy-700">"{r.comment}"</p>
                        <p className="mt-1 text-xs text-navy-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </DashboardCard>
            )}

            {section === 'notifications' && (
              <DashboardCard title="Notifications"
                action={notifs.length > 0 && <button onClick={async () => { await Notifications.markAll(); setNotifs(notifs.map((n) => ({...n, read: true}))); }} className="text-xs text-navy-500 hover:text-navy-700">Mark all read</button>}>
                {notifs.length === 0 ? <EmptyState icon="🔔" title="You're all caught up." /> : (
                  <ul className="divide-y divide-navy-100">
                    {notifs.map((n) => (
                      <li key={n._id} className={`py-3 flex items-start gap-3 ${!n.read ? 'bg-navy-50/40 -mx-5 px-5' : ''}`}>
                        <span className={`w-2 h-2 mt-2 rounded-full ${!n.read ? 'bg-accent-500' : 'bg-navy-200'}`} />
                        <div className="flex-1">
                          <p className="font-semibold text-navy-900 text-sm">{n.title}</p>
                          <p className="text-sm text-navy-600">{n.message}</p>
                          <p className="text-xs text-navy-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </DashboardCard>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ---------- Profile Editor ----------
function ProfileSection() {
  const [profileData, setProfileData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const photoRef = useRef();
  const cvRef = useRef();

  useEffect(() => {
    Profile.get().then((p) => {
      if (p) setProfileData(p);
      else setProfileData({ about: '', skills: [], photo: '', cv: '', cvName: '' });
    }).catch(() => setProfileData({ about: '', skills: [], photo: '', cv: '', cvName: '' }));
  }, []);

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileData((prev) => ({ ...prev, photo: reader.result }));
    reader.readAsDataURL(file);
  }

  function handleCvChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileData((prev) => ({ ...prev, cv: reader.result, cvName: file.name }));
    reader.readAsDataURL(file);
  }

  function addSkill() {
    const sk = skillInput.trim();
    if (!sk) return;
    if (profileData.skills.includes(sk)) { setSkillInput(''); return; }
    setProfileData((prev) => ({ ...prev, skills: [...prev.skills, sk] }));
    setSkillInput('');
  }

  function removeSkill(sk) {
    setProfileData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== sk) }));
  }

  async function save() {
    setSaving(true);
    try {
      await Profile.update({
        about: profileData.about,
        skills: profileData.skills,
        photo: profileData.photo,
        cv: profileData.cv,
        cvName: profileData.cvName,
      });
      toast.success('Profile saved!');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  }

  if (!profileData) return <DashboardCard title="My Profile"><p className="text-sm text-navy-500">Loading…</p></DashboardCard>;

  return (
    <div className="space-y-5">
      {/* Photo */}
      <DashboardCard title="Profile Photo">
        <div className="flex items-center gap-5">
          {profileData.photo ? (
            <img src={profileData.photo} alt="" className="w-20 h-20 rounded-2xl object-cover border border-navy-100" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-navy-100 text-navy-400 grid place-items-center text-3xl">👤</div>
          )}
          <div>
            <button onClick={() => photoRef.current.click()} className="btn-outline text-sm">
              {profileData.photo ? 'Change photo' : 'Upload photo'}
            </button>
            {profileData.photo && (
              <button onClick={() => setProfileData((p) => ({ ...p, photo: '' }))} className="ml-2 text-xs text-red-500 hover:text-red-700">Remove</button>
            )}
            <p className="text-xs text-navy-400 mt-1">JPG or PNG, max 2MB</p>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
        </div>
      </DashboardCard>

      {/* About / Experience */}
      <DashboardCard title="About Me & Experience">
        <textarea
          value={profileData.about}
          onChange={(e) => setProfileData((p) => ({ ...p, about: e.target.value }))}
          rows={5}
          placeholder="Tell companies about yourself — your work experience, background, and what makes you a great hire…"
          className="w-full border border-navy-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 resize-none"
        />
      </DashboardCard>

      {/* Skills */}
      <DashboardCard title="Skills">
        <div className="flex gap-2 mb-3">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="e.g. Cashier, Cooking, Driving…"
            className="flex-1 border border-navy-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
          />
          <button onClick={addSkill} className="btn-primary text-sm px-4">Add</button>
        </div>
        {profileData.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profileData.skills.map((sk, i) => (
              <span key={i} className="chip bg-navy-50 text-navy-700 flex items-center gap-1">
                {sk}
                <button onClick={() => removeSkill(sk)} className="text-navy-400 hover:text-red-500 ml-1 font-bold leading-none">×</button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-navy-400">No skills added yet. Type a skill and press Add or Enter.</p>
        )}
      </DashboardCard>

      {/* CV */}
      <DashboardCard title="CV / Resume">
        <div className="flex items-center gap-4">
          {profileData.cv ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-50 border border-navy-100 flex-1">
              <span className="text-2xl">📄</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy-800 truncate">{profileData.cvName || 'CV uploaded'}</p>
                <a href={profileData.cv} download={profileData.cvName || 'cv'} className="text-xs text-accent-600 hover:underline">Download</a>
              </div>
              <button onClick={() => setProfileData((p) => ({ ...p, cv: '', cvName: '' }))} className="text-xs text-red-500 hover:text-red-700 shrink-0">Remove</button>
            </div>
          ) : (
            <div className="flex-1">
              <button onClick={() => cvRef.current.click()} className="btn-outline text-sm">Upload CV</button>
              <p className="text-xs text-navy-400 mt-1">PDF or Word document, max 5MB</p>
            </div>
          )}
          <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvChange} />
          {!profileData.cv && (
            <button onClick={() => cvRef.current.click()} className="shrink-0 btn-outline text-sm">Browse</button>
          )}
        </div>
      </DashboardCard>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}

// ---------- Job History with Rate button ----------
function HistorySection({ history }) {
  const [ratingApp, setRatingApp] = useState(null);
  const [rated, setRated] = useState(new Set());

  if (history.length === 0) {
    return <DashboardCard title="Job History"><EmptyState icon="🕐" title="No completed jobs to show yet." /></DashboardCard>;
  }
  return (
    <DashboardCard title="Job History">
      <ul className="divide-y divide-navy-100">
        {history.map((a) => (
          <li key={a._id} className="py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-navy-900">{a.job?.title}</p>
              <p className="text-sm text-navy-500">{a.job?.employer?.companyName}</p>
            </div>
            <div className="flex items-center gap-3">
              <ApplicationStatusBadge status={a.status} />
              {a.status === 'completed' && !rated.has(a._id) && (
                <button onClick={() => setRatingApp(a)} className="btn-outline text-xs">⭐ Rate Company</button>
              )}
              {rated.has(a._id) && (
                <span className="text-xs text-success-700 font-medium">Rated ✓</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <RateModal
        open={!!ratingApp}
        onClose={() => setRatingApp(null)}
        title={`Rate ${ratingApp?.job?.employer?.companyName || 'Company'}`}
        applicationId={ratingApp?._id}
        onSuccess={() => {
          setRated((prev) => new Set([...prev, ratingApp._id]));
          setRatingApp(null);
        }}
      />
    </DashboardCard>
  );
}

// ---------- Rate modal ----------
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
          <p className="text-sm text-navy-600 mb-2">How would you rate this company?</p>
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
            <p className="text-xs text-navy-500 mt-1">{['','Poor','Fair','Good','Very good','Excellent'][stars]}</p>
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

// ---------- Sidebar ----------
function Sidebar({ items, section, setSection, title }) {
  return (
    <aside className="card p-3 lg:sticky lg:top-20 lg:h-fit">
      <div className="px-2 pb-2 mb-2 border-b border-navy-100">
        <p className="text-xs uppercase tracking-wider text-navy-400 font-semibold">{title}</p>
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
  );
}

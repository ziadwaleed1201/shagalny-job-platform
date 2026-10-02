import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardCard from '../components/DashboardCard';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { SkeletonRows, EmptyState } from '../components/Skeleton';
import { Admin } from '../lib/api';

export default function AdminDashboard() {
  const [section, setSection] = useState('overview');
  const [stats, setStats] = useState(null);
  const [verifs, setVerifs] = useState({ users: [], employers: [] });
  const [reportedJobs, setReportedJobs] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Profile-view modal state
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  function reload() {
    setLoading(true);
    Promise.all([
      Admin.stats().catch(() => null),
      Admin.verifications().catch(() => ({ users: [], employers: [] })),
      Admin.reportedJobs().catch(() => []),
      Admin.pendingJobs().catch(() => []),
      Admin.tickets().catch(() => []),
      Admin.users().catch(() => []),
    ]).then(([s, v, rj, pj, t, u]) => {
      setStats(s); setVerifs(v); setReportedJobs(rj);
      setPendingPosts(pj); setTickets(t); setUsers(u);
    }).finally(() => setLoading(false));
  }

  useEffect(() => { reload(); }, []);

  async function decideUser(id, decision) {
    try {
      await Admin.decideUser(id, decision);
      toast.success(`User ${decision}`);
      reload();
    } catch (err) { toast.error(err.friendlyMessage || 'Failed'); }
  }
  async function decideEmployer(id, decision) {
    try {
      await Admin.decideEmployer(id, decision);
      toast.success(`Employer ${decision}`);
      reload();
    } catch (err) { toast.error(err.friendlyMessage || 'Failed'); }
  }
  async function decideJob(id, decision) {
    try {
      await Admin.decideJob(id, decision);
      toast.success(`Job ${decision}`);
      reload();
    } catch (err) { toast.error(err.friendlyMessage || 'Failed'); }
  }

  // Open the profile modal and fetch the full profile for a user.
  async function openProfile(u) {
    setProfileOpen(true);
    setProfile(null);
    setProfileLoading(true);
    try {
      const data = await Admin.userProfile(u._id);
      setProfile(data);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not load profile');
      setProfileOpen(false);
    } finally {
      setProfileLoading(false);
    }
  }

  // Suspend or reactivate an account.
  async function changeStatus(u, status) {
    setBusyId(u._id);
    try {
      await Admin.setUserStatus(u._id, status);
      toast.success(status === 'suspended' ? 'Account suspended' : 'Account reactivated');
      reload();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed');
    } finally {
      setBusyId(null);
    }
  }

  const verifCount = (verifs.users?.length || 0) + (verifs.employers?.length || 0);

  // Filter the users table by account type.
  const filteredUsers = users.filter((u) =>
    userFilter === 'all' ? true
    : userFilter === 'companies' ? u.role === 'vacancy'
    : userFilter === 'seekers' ? u.role === 'seeker'
    : true
  );

  const userFilters = [
    { id: 'all', label: 'All' },
    { id: 'companies', label: 'Companies' },
    { id: 'seekers', label: 'Job seekers' },
  ];

  const items = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'verifications', label: 'Verifications', icon: '🛡', count: verifCount },
    { id: 'jobposts', label: 'Pending Job Posts', icon: '📋', count: pendingPosts.length },
    { id: 'reports', label: 'Reported Jobs', icon: '⚠', count: reportedJobs.length },
    { id: 'users', label: 'Manage Users', icon: '👥', count: users.length },
    { id: 'tickets', label: 'Support Tickets', icon: '🎫', count: tickets.filter((t) => t.status === 'open').length },
  ];

  return (
    <div>
      <Navbar />
      <div className="section py-8 animate-fade-in">
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="chip bg-navy-900 text-white">Admin</span>
            <span className="chip bg-red-50 text-red-700">Internal</span>
          </div>
          <h1 className="text-3xl font-extrabold">Platform Operations</h1>
          <p className="text-navy-500 text-sm">Moderate users, employers, and listings.</p>
        </header>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          <aside className="card p-3 lg:sticky lg:top-20 lg:h-fit">
            <div className="px-2 pb-2 mb-2 border-b border-navy-100">
              <p className="text-xs uppercase tracking-wider text-navy-400 font-semibold">Admin</p>
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
                      <span className="text-xs px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 font-semibold">{it.count}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="space-y-6">
            {section === 'overview' && (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard icon="👥" value={(stats?.totalUsers || 0).toLocaleString()} label="Total users" accent="navy" />
                  <StatCard icon="🏢" value={(stats?.totalEmployers || 0).toLocaleString()} label="Companies" accent="accent" />
                  <StatCard icon="📋" value={(stats?.totalJobs || 0).toLocaleString()} label="Total jobs" accent="amber" />
                  <StatCard icon="🤝" value={(stats?.successfulHires || 0).toLocaleString()} label="Successful hires" accent="success" />
                  <StatCard icon="📍" value={stats?.citiesCovered || 0} label="Cities covered" accent="navy" />
                  <StatCard icon="⚠" value={reportedJobs.length} label="Active reports" accent="amber" />
                </div>

                <DashboardCard title="Recent activity">
                  <ul className="divide-y divide-navy-100">
                    {[
                      { icon: '🛡', text: `${verifCount} verification requests in queue` },
                      { icon: '📋', text: `${pendingPosts.length} job posts awaiting approval` },
                      { icon: '⚠', text: `${reportedJobs.length} reports pending review` },
                      { icon: '🎫', text: `${tickets.filter((t) => t.status === 'open').length} open support tickets` },
                    ].map((a, i) => (
                      <li key={i} className="py-3 flex items-center gap-3 text-sm">
                        <span className="w-8 h-8 rounded-lg bg-navy-50 text-navy-700 grid place-items-center">{a.icon}</span>
                        <span className="text-navy-700">{a.text}</span>
                      </li>
                    ))}
                  </ul>
                </DashboardCard>
              </>
            )}

            {section === 'verifications' && (
              <>
                <DashboardCard title={`Users awaiting verification (${verifs.users.length})`}>
                  {loading ? <SkeletonRows /> : verifs.users.length === 0 ? <EmptyState icon="✓" title="No users pending." /> : (
                    <ul className="divide-y divide-navy-100">
                      {verifs.users.map((u) => (
                        <li key={u._id} className="py-4 flex flex-wrap items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-navy-900">{u.fullName}</p>
                            <p className="text-sm text-navy-500">{u.email} · age {u.age || '-'} · {u.city}</p>
                          </div>
                          <button onClick={() => decideUser(u._id, 'rejected')} className="text-sm text-red-600 px-3 py-2">Reject</button>
                          <button onClick={() => decideUser(u._id, 'verified')} className="btn-success text-xs">Approve</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </DashboardCard>

                <DashboardCard title={`Companies awaiting verification (${verifs.employers.length})`}>
                  {verifs.employers.length === 0 ? <EmptyState icon="✓" title="No companies pending." /> : (
                    <ul className="divide-y divide-navy-100">
                      {verifs.employers.map((e) => (
                        <li key={e._id} className="py-4 flex flex-wrap items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-navy-900">{e.companyName}</p>
                            <p className="text-sm text-navy-500">{e.industry} · {e.location}</p>
                          </div>
                          <button onClick={() => decideEmployer(e._id, 'rejected')} className="text-sm text-red-600 px-3 py-2">Reject</button>
                          <button onClick={() => decideEmployer(e._id, 'verified')} className="btn-success text-xs">Approve</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </DashboardCard>
              </>
            )}

            {section === 'jobposts' && (
              <DashboardCard title="Pending Job Posts">
                {pendingPosts.length === 0 ? <EmptyState icon="✓" title="Nothing pending. Nice work." /> : (
                  <ul className="divide-y divide-navy-100">
                    {pendingPosts.map((p) => (
                      <li key={p._id} className="py-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-navy-900">{p.title}</p>
                          <p className="text-sm text-navy-500">{p.employer?.companyName} · {new Date(p.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => decideJob(p._id, 'rejected')} className="text-sm text-red-600 px-3 py-2">Reject</button>
                          <button onClick={() => decideJob(p._id, 'open')} className="btn-success text-xs">Approve</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </DashboardCard>
            )}

            {section === 'reports' && (
              <DashboardCard title="Reported Jobs">
                {reportedJobs.length === 0 ? <EmptyState icon="✓" title="No reports to review." /> : (
                  <ul className="divide-y divide-navy-100">
                    {reportedJobs.map((j) => (
                      <li key={j._id} className="py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-navy-900">{j.title}</p>
                            <p className="text-sm text-red-700 mt-1">Reasons: {j.reports.map((r) => r.reason).join(', ')}</p>
                            <p className="text-xs text-navy-400 mt-1">{j.reports.length} report{j.reports.length === 1 ? '' : 's'} · {j.employer?.companyName}</p>
                          </div>
                          <span className="chip bg-red-50 text-red-700">{j.reports.length} reports</span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <a href={`/jobs/${j._id}`} target="_blank" rel="noreferrer" className="btn-outline text-xs">View job</a>
                          <button onClick={() => decideJob(j._id, 'rejected')} className="text-sm text-red-600 px-3 py-2">Remove listing</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </DashboardCard>
            )}

            {section === 'users' && (
              <DashboardCard title={`Users (${filteredUsers.length})`}>
                {/* Filter by account type */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {userFilters.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setUserFilter(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        userFilter === f.id
                          ? 'bg-navy-900 text-white'
                          : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {filteredUsers.length === 0 ? (
                  <EmptyState icon="👥" title="No users in this category." />
                ) : (
                  <div className="overflow-x-auto -mx-5">
                    <table className="w-full text-sm">
                      <thead className="text-xs uppercase tracking-wider text-navy-500 text-left bg-navy-50/60">
                        <tr>
                          <th className="px-5 py-3">Name</th>
                          <th className="px-5 py-3">Email</th>
                          <th className="px-5 py-3">Role</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => {
                          const canManage = u.role === 'seeker' || u.role === 'vacancy';
                          const suspended = u.accountStatus === 'suspended';
                          return (
                            <tr key={u._id} className="border-t border-navy-100">
                              <td className="px-5 py-3 font-medium text-navy-900">{u.fullName}</td>
                              <td className="px-5 py-3 text-navy-600">{u.email}</td>
                              <td className="px-5 py-3 capitalize">{u.role === 'vacancy' ? 'Company' : u.role}</td>
                              <td className="px-5 py-3">
                                <span className={`chip capitalize ${
                                  suspended ? 'bg-red-50 text-red-700'
                                  : u.accountStatus === 'active' ? 'bg-success-50 text-success-700'
                                  : 'bg-amber-50 text-amber-700'
                                }`}>{u.accountStatus}</span>
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2 justify-end">
                                  <button onClick={() => openProfile(u)} className="btn-outline text-xs">View</button>
                                  {canManage && (suspended ? (
                                    <button
                                      onClick={() => changeStatus(u, 'active')}
                                      disabled={busyId === u._id}
                                      className="btn-success text-xs disabled:opacity-50"
                                    >
                                      {busyId === u._id ? '…' : 'Activate'}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => changeStatus(u, 'suspended')}
                                      disabled={busyId === u._id}
                                      className="text-xs text-red-600 hover:text-red-700 px-3 py-2 disabled:opacity-50"
                                    >
                                      {busyId === u._id ? '…' : 'Suspend'}
                                    </button>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </DashboardCard>
            )}

            {section === 'tickets' && (
              <DashboardCard title="Support Tickets">
                {tickets.length === 0 ? <EmptyState icon="🎫" title="No support tickets." /> : (
                  <ul className="divide-y divide-navy-100">
                    {tickets.map((t) => (
                      <li key={t._id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-navy-900">{t.subject}</p>
                          <p className="text-sm text-navy-500">From {t.fromName} · {new Date(t.createdAt).toLocaleDateString()}</p>
                          <p className="text-sm text-navy-600 mt-1">{t.message}</p>
                        </div>
                        <span className={`chip ${t.status === 'open' ? 'bg-red-50 text-red-700' : 'bg-navy-50 text-navy-700'}`}>{t.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </DashboardCard>
            )}
          </div>
        </div>
      </div>

      {/* Full profile viewer */}
      <Modal open={profileOpen} onClose={() => setProfileOpen(false)} title="User profile" size="lg">
        {profileLoading || !profile ? (
          <p className="text-sm text-navy-500">Loading…</p>
        ) : (
          <ProfileBody profile={profile} />
        )}
      </Modal>

      <Footer />
    </div>
  );
}

// Small labelled field used inside the profile modal.
function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-navy-400 font-semibold">{label}</p>
      <p className="text-navy-800 break-words">{value}</p>
    </div>
  );
}

// Renders the full profile of a seeker or a company inside the modal.
function ProfileBody({ profile }) {
  const isSeeker = profile.role === 'seeker';
  const isCompany = profile.role === 'vacancy';
  const s = profile.seeker;
  const c = profile.company;
  const initial = (isCompany && c ? c.vacancyName : profile.fullName)?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        {isSeeker && s?.photo ? (
          <img src={s.photo} alt="" className="w-16 h-16 rounded-2xl object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-navy-700 text-white grid place-items-center text-xl font-bold">{initial}</div>
        )}
        <div>
          <p className="text-lg font-bold text-navy-900">{isCompany && c ? c.vacancyName : profile.fullName}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="chip bg-navy-50 text-navy-700 capitalize">{isCompany ? 'Company' : profile.role}</span>
            <span className={`chip capitalize ${
              profile.accountStatus === 'suspended' ? 'bg-red-50 text-red-700'
              : profile.accountStatus === 'active' ? 'bg-success-50 text-success-700'
              : 'bg-amber-50 text-amber-700'
            }`}>{profile.accountStatus}</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <Field label="Email" value={profile.email} />
        <Field label="Phone" value={profile.phone || '—'} />
        <Field label="Joined" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'} />
        {isSeeker && s && <Field label="Rating" value={`${Number(s.rating || 0).toFixed(1)} / 5`} />}
        {isCompany && c && <Field label="Rating" value={`${Number(c.rating || 0).toFixed(1)} / 5`} />}
      </div>

      {isSeeker && s && (
        <>
          {s.nationalId && <Field label="National ID" value={s.nationalId} />}
          {s.about && (
            <div>
              <p className="text-xs uppercase tracking-wider text-navy-400 font-semibold mb-1">About</p>
              <p className="text-sm text-navy-700 whitespace-pre-wrap">{s.about}</p>
            </div>
          )}
          {s.skills?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-navy-400 font-semibold mb-1">Skills</p>
              <div className="flex flex-wrap gap-2">
                {s.skills.map((sk, i) => <span key={i} className="chip bg-navy-50 text-navy-700">{sk}</span>)}
              </div>
            </div>
          )}
          {s.cv && (
            <a href={s.cv} download={s.cvName || 'cv'} className="btn-outline text-xs inline-block">
              ⬇ Download CV{s.cvName ? ` (${s.cvName})` : ''}
            </a>
          )}
        </>
      )}

      {isCompany && c && (
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Field label="Company name" value={c.vacancyName} />
          <Field label="License" value={c.vacancyLicense || '—'} />
          <Field label="Verification" value={c.vacancyStatus} />
        </div>
      )}

      {((isSeeker && !s) || (isCompany && !c)) && (
        <p className="text-sm text-navy-500">No extended profile details on file.</p>
      )}
    </div>
  );
}

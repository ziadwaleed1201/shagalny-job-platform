import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardCard from '../components/DashboardCard';
import StatCard from '../components/StatCard';
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
  const [loading, setLoading] = useState(true);

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

  const verifCount = (verifs.users?.length || 0) + (verifs.employers?.length || 0);

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
                  <StatCard icon="🏢" value={(stats?.totalEmployers || 0).toLocaleString()} label="Employers" accent="accent" />
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

                <DashboardCard title={`Employers awaiting verification (${verifs.employers.length})`}>
                  {verifs.employers.length === 0 ? <EmptyState icon="✓" title="No employers pending." /> : (
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
              <DashboardCard title={`All Users (${users.length})`}>
                <div className="overflow-x-auto -mx-5">
                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase tracking-wider text-navy-500 text-left bg-navy-50/60">
                      <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Status</th></tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-t border-navy-100">
                          <td className="px-5 py-3 font-medium text-navy-900">{u.fullName}</td>
                          <td className="px-5 py-3 text-navy-600">{u.email}</td>
                          <td className="px-5 py-3 capitalize">{u.role}</td>
                          <td className="px-5 py-3 capitalize">{u.accountStatus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
      <Footer />
    </div>
  );
}

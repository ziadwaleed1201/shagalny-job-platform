import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi, jobApi } from '../lib/api';

export default function ModeratorJobQueue() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { setJobs(await adminApi.pendingJobs()); }
    catch (e) { toast.error(e.response?.data?.message || 'Could not load jobs'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const decide = async (id, status) => {
    try {
      await jobApi.setStatus(id, status);
      toast.success(status === 'open' ? 'Job approved' : 'Job closed');
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (e) { toast.error(e.response?.data?.message || 'Action failed'); }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-semibold text-navy-700">Job approval queue</h1>
      <p className="mt-1 text-sm text-navy-400">Review jobs posted by companies before they go live.</p>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="h-20 animate-pulse rounded-2xl bg-navy-50" />
        ) : jobs.length === 0 ? (
          <p className="text-sm text-navy-400">Nothing pending. All caught up.</p>
        ) : jobs.map((j) => (
          <div key={j._id} className="rounded-2xl bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-navy-700">{j.title}</p>
                <p className="text-xs text-navy-400">{j.vacancy?.vacancyName} · {j.location} · {j.salary} EGP</p>
                {j.description && <p className="mt-2 text-sm text-navy-500">{j.description}</p>}
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => decide(j._id, 'open')}
                  className="rounded-xl bg-success-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-success-600">
                  Approve
                </button>
                <button onClick={() => decide(j._id, 'closed')}
                  className="rounded-xl border border-navy-200 px-3 py-1.5 text-sm font-semibold text-navy-600 hover:bg-navy-50">
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

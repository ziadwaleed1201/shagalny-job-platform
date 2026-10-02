import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../lib/api';

export default function AdminPendingVacancies() {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { setVacancies(await adminApi.pendingVacancies()); }
    catch (e) { toast.error(e.response?.data?.message || 'Could not load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const verify = async (id) => {
    try {
      await adminApi.verifyVacancy(id);
      toast.success('Company verified');
      setVacancies((prev) => prev.filter((v) => v._id !== id));
    } catch (e) { toast.error(e.response?.data?.message || 'Action failed'); }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-semibold text-navy-700">Pending company verifications</h1>
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="h-16 animate-pulse rounded-2xl bg-navy-50" />
        ) : vacancies.length === 0 ? (
          <p className="text-sm text-navy-400">No companies awaiting verification.</p>
        ) : vacancies.map((v) => (
          <div key={v._id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-card">
            <div>
              <p className="font-semibold text-navy-700">{v.vacancyName}</p>
              <p className="text-xs text-navy-400">License {v.vacancyLicense} · {v.user?.email}</p>
            </div>
            <button onClick={() => verify(v._id)}
              className="rounded-xl bg-success-500 px-4 py-2 text-sm font-semibold text-white hover:bg-success-600">
              Verify
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import SearchFilters from '../components/SearchFilters';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { SkeletonCard } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { Jobs, SavedJobs, Applications } from '../lib/api';

const initialFilters = {
  q: '', location: '', jobTypes: [], minSalary: 0,
  shiftLength: '', dateFrom: '', verifiedOnly: false,
};

export default function JobListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [savedIds, setSavedIds] = useState([]);
  const [sort, setSort] = useState('recent');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedIds, setAppliedIds] = useState([]);
  const [applyJob, setApplyJob] = useState(null);
  const [coverNote, setCoverNote] = useState('');

  // Server-side params
  const params = useMemo(() => {
    const p = { sort };
    if (filters.q.trim()) p.q = filters.q.trim();
    if (filters.location) p.city = filters.location;
    if (filters.jobTypes.length) p.jobTypes = filters.jobTypes.join(',');
    if (filters.minSalary > 0) p.minSalary = filters.minSalary;
    if (filters.dateFrom) p.dateFrom = filters.dateFrom;
    if (filters.shiftLength) p.shiftLength = filters.shiftLength;
    if (filters.verifiedOnly) p.verifiedOnly = true;
    return p;
  }, [filters, sort]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Jobs.list(params)
      .then((data) => { if (!cancelled) setJobs(data); })
      .catch((err) => toast.error(err.friendlyMessage || 'Failed to load jobs.'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params]);

  useEffect(() => {
    if (!user) return;
    SavedJobs.list().then((list) => setSavedIds(list.map((j) => j._id))).catch(() => {});
  }, [user]);

  // Load the jobs this seeker has already applied to, so the button reflects it
  useEffect(() => {
    if (!user || user.role !== 'seeker') { setAppliedIds([]); return; }
    Applications.mine()
      .then((list) => setAppliedIds(list.map((a) => a.job?._id).filter(Boolean)))
      .catch(() => {});
  }, [user]);

  async function toggleSave(id) {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await SavedJobs.toggle(id);
      setSavedIds(res.savedJobs);
      toast.success(res.saved ? 'Job saved' : 'Removed from saved');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not save.');
    }
  }

  function handleApply(id) {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'seeker') {
      toast.error('Only job seekers can apply to jobs.');
      return;
    }
    if (appliedIds.includes(id)) {
      toast('You already applied to this job.');
      return;
    }
    const raw = jobs.find((j) => j._id === id);
    setCoverNote('');
    setApplyJob(raw ? normalizeJob(raw) : { id });
  }

  async function submitApplication() {
    if (!applyJob) return;
    try {
      await Applications.apply(applyJob.id, coverNote);
      toast.success('Application sent!');
      setAppliedIds((ids) => [...ids, applyJob.id]);
      setApplyJob(null);
      setCoverNote('');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not apply.');
    }
  }

  return (
    <div>
      <Navbar />
      <div className="section py-8 animate-fade-in">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold">Find your next shift</h1>
          <p className="text-navy-500 mt-1">
            {loading ? 'Loading...' : `${jobs.length} open job${jobs.length === 1 ? '' : 's'} from verified employers in Egypt.`}
          </p>
        </header>

        <div className="card p-3 sm:p-4 flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 flex items-center gap-2 px-3 rounded-lg bg-navy-50">
            <svg className="w-5 h-5 text-navy-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
            </svg>
            <input type="text" placeholder="Search by job title or tag..."
              value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              className="flex-1 bg-transparent py-2.5 outline-none text-navy-900 placeholder-navy-400" />
          </div>
          <select className="input sm:w-48" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="recent">Most recent</option>
            <option value="salary">Highest pay</option>
            <option value="rating">Highest rated</option>
          </select>
          <button className="btn-outline sm:hidden" onClick={() => setShowMobileFilters((v) => !v)}>Filters</button>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <div className="hidden lg:block">
            <SearchFilters filters={filters} onChange={setFilters} onReset={() => setFilters(initialFilters)} />
          </div>
          {showMobileFilters && (
            <div className="lg:hidden">
              <SearchFilters filters={filters} onChange={setFilters} onReset={() => setFilters(initialFilters)} />
            </div>
          )}

          <div className="grid gap-4">
            {loading ? (
              <>
                <SkeletonCard /><SkeletonCard /><SkeletonCard />
              </>
            ) : jobs.length === 0 ? (
              <div className="card p-10 text-center">
                <div className="text-5xl mb-3">🔍</div>
                <p className="font-semibold text-navy-800">No jobs match your filters.</p>
                <p className="text-sm text-navy-500 mt-1">Try widening your search.</p>
                <button onClick={() => setFilters(initialFilters)} className="btn-primary mt-4 text-sm">Reset filters</button>
              </div>
            ) : (
              jobs.map((job) => (
                <JobCard key={job._id} job={normalizeJob(job)}
                  saved={savedIds.includes(job._id)}
                  applied={appliedIds.includes(job._id)}
                  onSave={toggleSave} onApply={handleApply} />
              ))
            )}
          </div>
        </div>
      </div>

      <Modal open={!!applyJob} onClose={() => setApplyJob(null)} title="Apply for this job"
        footer={<>
          <button onClick={() => setApplyJob(null)} className="btn-ghost text-sm">Cancel</button>
          <button onClick={submitApplication} className="btn-accent text-sm">Send application</button>
        </>}>
        {applyJob && (
          <>
            <p className="text-sm text-navy-600 mb-4">
              You're applying to <strong className="text-navy-900">{applyJob.title}</strong> at {applyJob.companyName}.
            </p>
            <FormInput as="textarea" label="Short message to the employer (optional)"
              placeholder="Why are you a good fit? Any availability notes?"
              value={coverNote} onChange={(e) => setCoverNote(e.target.value)}
              hint="A friendly note helps you stand out." />
          </>
        )}
      </Modal>

      <Footer />
    </div>
  );
}

// Adapt server shape to component prop shape
export function normalizeJob(j) {
  return {
    id: j._id,
    title: j.title,
    companyName: j.employer?.companyName || 'Verified employer',
    isVerified: j.employer?.verificationStatus === 'verified',
    rating: j.employer?.rating || j.rating || 0,
    salary: j.salary,
    salaryUnit: j.salaryUnit,
    location: j.location,
    city: j.city,
    shiftDate: j.shiftDate ? new Date(j.shiftDate).toLocaleDateString('en-CA') : '',
    shiftTime: j.shiftTime,
    duration: j.duration,
    jobType: j.jobType,
    tags: j.tags || [],
    applicants: j.applicantsCount || 0,
  };
}

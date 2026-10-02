import axios from 'axios';

const STORAGE_KEY = 'shagalny_auth';

// Frontend runs on 5173, backend runs on 5001
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const { token } = JSON.parse(raw) || {};
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch { /* ignore */ }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    let friendly = 'Network error — make sure the API is running.';
    if (err.response) {
      friendly =
        err.response.data?.message ||
        (err.response.status === 401 ? 'Session expired. Please sign in again.'
          : err.response.status === 403 ? 'You do not have permission for this action.'
          : err.response.status === 404 ? 'Not found.'
          : `Server error (${err.response.status}).`);
      if (err.response.status === 401 && !err.config?.url?.includes('/auth/')) {
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
        window.dispatchEvent(new Event('auth:logout'));
      }
    } else if (err.request) {
      friendly = 'Could not reach the server. Is the backend running on port 5001?';
    } else if (err.message) {
      friendly = err.message;
    }
    err.friendlyMessage = friendly;
    return Promise.reject(err);
  }
);

export default api;

// ---------- Adapters: map new backend shapes to what the UI expects ----------

// The UI was built around a richer "job" shape with a flattened employer.
// Normalize the lean backend job (which references `vacancy`) into that shape,
// exposing an `employer` alias and safe defaults so no field renders undefined.
function adaptJob(j) {
  if (!j) return j;
  const v = j.vacancy && typeof j.vacancy === 'object' ? j.vacancy : null;
  return {
    ...j,
    _id: j._id,
    title: j.title,
    salary: j.salary ?? 0,
    location: j.location || '—',
    description: j.description || '',
    requirements: j.requirements || [],
    status: j.status,
    createdAt: j.createdAt,
    // employer alias (vacancy = the company)
    employer: {
      _id: v?._id,
      companyName: v?.vacancyName || 'Verified company',
      verificationStatus: v?.vacancyStatus || 'pending',
      rating: v?.rating || 0,
      industry: '',
      location: j.location || '',
      logo: '',
      description: '',
      employeeCount: '',
    },
    // defaults for fields the lean schema doesn't store
    salaryUnit: j.salaryUnit || 'shift',
    jobType: j.jobType || 'Part-time',
    shiftDate: j.shiftDate || j.createdAt || null,
    shiftTime: j.shiftTime || '—',
    duration: j.duration || '—',
    workersNeeded: j.workersNeeded || '—',
    city: j.location || '',
    applicantsCount: j.applicantsCount ?? 0,
    viewsCount: j.viewsCount ?? 0,
    contactMethod: 'In-app',
    instructions: j.instructions || '',
  };
}

function adaptApplication(a) {
  if (!a) return a;
  const seekerUser = a.jobSeeker && a.jobSeeker.user ? a.jobSeeker.user : null;
  return {
    ...a,
    createdAt: a.createdAt || a.applicationDate,
    job: a.job && typeof a.job === 'object' ? adaptJob(a.job) : a.job,
    // `user` alias so existing dashboard code (a.user.name) keeps working
    user: seekerUser
      ? {
          _id: seekerUser._id,
          name: seekerUser.fullName,
          rating: a.jobSeeker?.rating || 0,
          verificationStatus: 'verified',
        }
      : undefined,
  };
}

// Map a backend review (fromUser populated with fullName) to the UI shape.
function adaptReview(r) {
  if (!r) return r;
  return { ...r, fromUser: { name: r.fromUser?.fullName || 'User' } };
}

// ---------- Auth ----------
export const Auth = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  forgot: () => Promise.resolve({ message: 'If that email exists, a reset link has been sent.' }),
};

// ---------- Seeker profile ----------
export const Profile = {
  get: () => api.get('/auth/profile').then((r) => r.data),
  update: (data) => api.put('/auth/profile', data).then((r) => r.data),
};

// ---------- Jobs ----------
export const Jobs = {
  list: (params) => api.get('/jobs', { params }).then((r) => (r.data || []).map(adaptJob)),
  get: (id) => api.get(`/jobs/${id}`).then((r) => adaptJob(r.data)),
  create: (data) => api.post('/jobs', data).then((r) => r.data),
  mine: () => api.get('/jobs/mine').then((r) => (r.data || []).map(adaptJob)),
  // Backend exposes status changes; generic update/delete/report are not in the lean API.
  update: (id, data) => api.put(`/jobs/${id}/status`, data).then((r) => r.data),
  setStatus: (id, status) => api.put(`/jobs/${id}/status`, { status }).then((r) => r.data),
  remove: () => Promise.resolve({ ok: true }),
  report: () => Promise.resolve({ ok: true }),
};

// ---------- Applications ----------
export const Applications = {
  apply: (jobId) => api.post('/applications', { job: jobId }).then((r) => r.data),
  mine: () => api.get('/applications/mine').then((r) => (r.data || []).map(adaptApplication)),
  forEmployer: () => api.get('/applications/vacancy').then((r) => (r.data || []).map(adaptApplication)),
  updateStatus: (id, status) => api.put(`/applications/${id}`, { status }).then((r) => r.data),
};

// ---------- Cards (new) ----------
export const Cards = {
  list: () => api.get('/cards').then((r) => r.data),
  add: (data) => api.post('/cards', data).then((r) => r.data),
};

// ---------- Payments (new, escrow) ----------
export const Payments = {
  initiate: (data) => api.post('/payments', data).then((r) => r.data),
  release: (id) => api.put(`/payments/${id}/release`).then((r) => r.data),
  refund: (id) => api.put(`/payments/${id}/refund`).then((r) => r.data),
  get: (id) => api.get(`/payments/${id}`).then((r) => r.data),
  listAll: () => api.get('/payments').then((r) => r.data),
};

// ---------- Company / Vacancy ----------
export const Employers = {
  me: () => api.get('/vacancies/me').then((r) => {
    const v = r.data || {};
    return {
      _id: v._id,
      companyName: v.vacancyName,
      verificationStatus: v.vacancyStatus,
      vacancyLicense: v.vacancyLicense,
      rating: v.rating || 0,
      industry: '',
      location: '',
      logo: '',
    };
  }),
  update: (data) => api.put('/vacancies/me', data).then((r) => r.data),
  get: (id) => api.get(`/vacancies/${id}`).then((r) => r.data),
};

// ---------- Admin ----------
export const Admin = {
  stats: () => api.get('/admin/stats').then((r) => r.data),
  verifications: () => Promise.all([
    api.get('/admin/pending-users').then((r) => r.data).catch(() => []),
    api.get('/admin/pending-vacancies').then((r) => r.data).catch(() => []),
  ]).then(([users, vacancies]) => ({
    users: (users || []).map((u) => ({
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      age: u.age,
      city: u.city,
    })),
    employers: (vacancies || []).map((v) => ({
      _id: v._id,
      companyName: v.vacancyName,
      industry: '',
      location: '',
    })),
  })),
  decideUser: (id, decision) =>
    decision === 'verified'
      ? api.put(`/admin/verify-user/${id}`).then((r) => r.data)
      : api.delete(`/admin/reject-user/${id}`).then((r) => r.data),
  decideEmployer: (id, decision) =>
    decision === 'verified'
      ? api.put(`/admin/verify-vacancy/${id}`).then((r) => r.data)
      : Promise.resolve({ ok: true }),
  pendingJobs: () => api.get('/admin/pending-jobs').then((r) => (r.data || []).map(adaptJob)),
  decideJob: (id, decision) =>
    api.put(`/jobs/${id}/status`, { status: decision === 'open' ? 'open' : 'closed' }).then((r) => r.data),
  reportedJobs: () => Promise.resolve([]),
  tickets: () => Promise.resolve([]),
  users: () => api.get('/admin/users').then((r) => r.data),
  // View a full profile (seeker or company) and suspend / reactivate an account.
  userProfile: (id) => api.get(`/admin/user-profile/${id}`).then((r) => r.data),
  setUserStatus: (id, status) => api.put(`/admin/user-status/${id}`, { status }).then((r) => r.data),
  payments: () => api.get('/payments').then((r) => r.data),
};

// ---------- Removed-but-stubbed (Reviews / Notifications / SavedJobs / Stats / Support) ----------
export const SavedJobs = {
  list: () => api.get('/saved-jobs').then((r) => (r.data || []).map(adaptJob)),
  toggle: (jobId) => api.post(`/saved-jobs/${jobId}/toggle`).then((r) => r.data),
};
export const Notifications = {
  mine: () => api.get('/notifications').then((r) => r.data),
  markRead: (id) => api.put(`/notifications/${id}/read`).then((r) => r.data),
  markAll: () => api.put('/notifications/read-all').then((r) => r.data),
};
export const Reviews = {
  forUser: () => api.get('/reviews/mine').then((r) => (r.data || []).map(adaptReview)),
  forEmployer: (vacancyId) => api.get(`/reviews/vacancy/${vacancyId}`).then((r) => (r.data || []).map(adaptReview)),
  create: (data) => api.post('/reviews', data).then((r) => r.data),
};
export const Stats = {
  platform: () => Promise.resolve({}),
};
export const Support = {
  submitTicket: () => Promise.resolve({ message: 'Thanks — your message was received.' }),
};

// ---------- Aliases for the newer card/payment/admin screens ----------
export const cardApi = Cards;
export const paymentApi = Payments;
export const jobApi = Jobs;
export const adminApi = {
  // raw (un-adapted) shapes for the dedicated moderator/admin screens
  pendingVacancies: () => api.get('/admin/pending-vacancies').then((r) => r.data),
  verifyVacancy: (id) => api.put(`/admin/verify-vacancy/${id}`).then((r) => r.data),
  pendingJobs: () => api.get('/admin/pending-jobs').then((r) => r.data),
};

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import FormInput from '../components/FormInput';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const login = auth?.login;

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => {
    setForm((prev) => ({ ...prev, [k]: e.target.value }));
    setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  function validate() {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error('Please fix the highlighted fields.');
      return;
    }
    if (!login) {
      toast.error('Auth not ready. Reload the page.');
      return;
    }
    setSubmitting(true);
    try {
      const user = await login(form.email.trim().toLowerCase(), form.password);
      const role = user?.role;
      const firstName = (user?.fullName || '').split(' ')[0] || '';
      toast.success(firstName ? `Welcome back, ${firstName}!` : 'Welcome back!');
      const dest = location.state?.from?.pathname
        || (role === 'admin' ? '/admin'
          : role === 'vacancy' ? '/dashboard/employer'
          : '/dashboard/seeker');
      navigate(dest, { replace: true });
    } catch (err) {
      console.error('Login failed:', err);
      toast.error(
        err?.response?.data?.message
        || err?.friendlyMessage
        || err?.message
        || 'Invalid email or password.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <AuthSide />
      <main className="flex flex-col justify-center p-6 sm:p-12">
        <div className="w-full max-w-md mx-auto animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <span className="w-9 h-9 rounded-xl bg-navy-700 text-white grid place-items-center font-bold">S</span>
            <span className="text-xl font-bold">Shagalny<span className="text-accent-500">.</span></span>
          </Link>

          <h1 className="text-3xl font-extrabold">Welcome back</h1>
          <p className="mt-2 text-navy-500">Sign in to manage your shifts and applications.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
            <FormInput
              label="Email address" type="email" placeholder="you@example.com"
              value={form.email} onChange={set('email')} error={errors.email} autoComplete="email"
            />
            <FormInput
              label="Password" type="password" placeholder="Your password"
              value={form.password} onChange={set('password')} error={errors.password} autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4 rounded text-navy-600" />
                <span className="text-navy-700">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-navy-700 hover:text-navy-900">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>

            <p className="text-center text-sm text-navy-500 pt-2">
              New to Shagalny?{' '}
              <Link to="/register" className="font-semibold text-navy-700 hover:text-navy-900">
                Create an account
              </Link>
            </p>

            <div className="mt-4 p-3 rounded-lg bg-navy-50/50 border border-navy-100 text-xs text-navy-600">
              <p className="font-semibold text-navy-700 mb-1">Demo accounts (after running <code>npm run seed</code>):</p>
              <p>Seeker: <code className="text-navy-900">youssef@example.com</code> / password123</p>
              <p>Employer: <code className="text-navy-900">karim@pyramidevents.eg</code> / password123</p>
              <p>Admin: <code className="text-navy-900">admin@shagalny.eg</code> / admin1234</p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export function AuthSide() {
  return (
    <aside className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-navy-800 to-navy-900 text-white relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-accent-500/20 blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 rounded-full bg-success-500/20 blur-3xl animate-pulse-slow" />
      <div className="relative">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-accent-500 text-white grid place-items-center font-bold">S</span>
          <span className="text-xl font-bold text-white">Shagalny<span className="text-accent-400">.</span></span>
        </Link>
      </div>
      <div className="relative">
        <p className="text-accent-300 font-semibold text-sm mb-2 uppercase tracking-wider">Built for Egypt</p>
        <h2 className="text-3xl font-extrabold text-white leading-snug">
          The trusted way to find part-time work in Cairo, Giza & Alexandria.
        </h2>
        <p className="mt-4 text-navy-200 leading-relaxed max-w-md">
          Verified employers. Clear pay. Same-day shifts. Join thousands of students earning extra income safely.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[['12K+', 'Workers'], ['640+', 'Employers'], ['9.3K', 'Hires']].map(([v, l]) => (
            <div key={l} className="bg-white/10 rounded-xl p-3 backdrop-blur">
              <p className="text-2xl font-extrabold">{v}</p>
              <p className="text-xs text-navy-200">{l}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="relative text-xs text-navy-300">© {new Date().getFullYear()} Shagalny. Built for youth employment in Egypt.</p>
    </aside>
  );
}

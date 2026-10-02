import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormInput from '../components/FormInput';
import { AuthSide } from './Login';
import { Auth } from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await Auth.forgot(email);
      setSent(true);
    } catch {
      setSent(true); // always show generic success to avoid email enumeration
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

          {!sent ? (
            <>
              <h1 className="text-3xl font-extrabold">Forgot your password?</h1>
              <p className="mt-2 text-navy-500">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
                <FormInput label="Email address" type="email" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          ) : (
            <div className="card p-6 border-success-200 bg-success-50/40 animate-slide-up">
              <div className="w-12 h-12 rounded-xl bg-success-100 text-success-700 grid place-items-center text-xl mb-4">✓</div>
              <h2 className="text-xl font-bold text-navy-900">Check your email</h2>
              <p className="mt-2 text-navy-600">
                If an account exists for <strong className="text-navy-900">{email}</strong>, a reset link has been sent.
              </p>
            </div>
          )}

          <p className="text-center text-sm text-navy-500 mt-6">
            Remembered it?{' '}
            <Link to="/login" className="font-semibold text-navy-700 hover:text-navy-900">Back to sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

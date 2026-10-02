import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import FormInput from '../components/FormInput';
import { useAuth } from '../context/AuthContext';
import { AuthSide } from './Login';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [accountType, setAccountType] = useState('seeker');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    city: 'Cairo',
    nationalId: '',
    companyName: '',
    vacancyLicense: '',
    industry: 'Event Management',
    password: '',
    confirm: '',
    agree: false,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    setForm((prev) => ({
      ...prev,
      [k]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [k]: '',
    }));
  };

  function validate() {
    const e = {};

    if (!form.name.trim()) {
      e.name = 'Your name is required.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Enter a valid email.';
    }

    if (!/^\+?\d[\d\s-]{6,}$/.test(form.phone)) {
      e.phone = 'Enter a valid phone number.';
    }

    if (accountType === 'seeker') {
      const age = Number(form.age);

      if (!form.age) {
        e.age = 'Age is required.';
      } else if (Number.isNaN(age) || age < 16) {
        e.age = 'You must be at least 16 to register.';
      } else if (age > 80) {
        e.age = 'Enter a realistic age.';
      }

      if (!/^\d{14}$/.test(form.nationalId.trim())) {
        e.nationalId = 'Enter your 14-digit national ID.';
      }
    }

    if (accountType === 'vacancy') {
      if (!form.companyName.trim()) {
        e.companyName = 'Company name is required.';
      }
      if (!form.vacancyLicense.trim()) {
        e.vacancyLicense = 'Business license number is required.';
      }
    }

    if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters.';
    }

    if (form.password !== form.confirm) {
      e.confirm = 'Passwords do not match.';
    }

    if (!form.agree) {
      e.agree = 'You must accept the terms to continue.';
    }

    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();

    console.log('Create account clicked');
    console.log('Current form:', form);
    console.log('Account type:', accountType);

    const next = validate();
    setErrors(next);

    if (Object.keys(next).length) {
      console.log('Validation errors:', next);
      toast.error('Please fix the highlighted errors.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        fullName: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        role: accountType,
      };

      if (accountType === 'seeker') {
        payload.nationalId = form.nationalId.trim();
      } else {
        payload.vacancyName = form.companyName.trim();
        payload.vacancyLicense = form.vacancyLicense.trim();
      }

      console.log('Register payload:', payload);

      const data = await register(payload);

      console.log('Register response:', data);

      toast.success('Welcome to Shagalny!');

      const role = data?.role || data?.user?.role || accountType;

      navigate(
        role === 'vacancy' ? '/dashboard/employer' : '/dashboard/seeker',
        { replace: true }
      );
    } catch (err) {
      console.error('Register failed:', err);

      toast.error(
        err?.response?.data?.message ||
          err?.friendlyMessage ||
          err?.message ||
          'Could not create account.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <AuthSide />

      <main className="flex flex-col justify-center p-6 sm:p-12">
        <div className="w-full max-w-lg mx-auto animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="w-9 h-9 rounded-xl bg-navy-700 text-white grid place-items-center font-bold">
              S
            </span>

            <span className="text-xl font-bold">
              Shagalny<span className="text-accent-500">.</span>
            </span>
          </Link>

          <h1 className="text-3xl font-extrabold">Create your account</h1>

          <p className="mt-2 text-navy-500">
            Pick the type of account you want to start with.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <AccountTypeCard
              active={accountType === 'seeker'}
              onClick={() => setAccountType('seeker')}
              icon="🎓"
              title="Job Seeker"
              desc="I want to find shifts and earn."
            />

            <AccountTypeCard
              active={accountType === 'vacancy'}
              onClick={() => setAccountType('vacancy')}
              icon="🏢"
              title="Company/vacancy"
              desc="I want to hire workers fast."
            />
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            {accountType === 'seeker' ? (
              <>
                <FormInput
                  label="Full name"
                  placeholder="e.g. Youssef Ahmed"
                  value={form.name}
                  onChange={set('name')}
                  error={errors.name}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Age"
                    type="number"
                    placeholder="16+"
                    min="16"
                    max="80"
                    value={form.age}
                    onChange={set('age')}
                    error={errors.age}
                    hint="Must be 16+ per Egyptian labor law."
                  />

                  <FormInput
                    label="City"
                    as="select"
                    options={[
                      'Cairo',
                      'Giza',
                      'Alexandria',
                      'Mansoura',
                      'Tanta',
                      'Suez',
                      'Other',
                    ]}
                    value={form.city}
                    onChange={set('city')}
                  />
                </div>

                <FormInput
                  label="National ID"
                  placeholder="14-digit national ID"
                  value={form.nationalId}
                  onChange={set('nationalId')}
                  error={errors.nationalId}
                  hint="Used to verify your identity (per Egyptian labor law)."
                />
              </>
            ) : (
              <>
                <FormInput
                  label="Your name (contact person)"
                  placeholder="e.g. Karim Helal"
                  value={form.name}
                  onChange={set('name')}
                  error={errors.name}
                />

                <FormInput
                  label="Company name"
                  placeholder="e.g. Pyramid Events Co."
                  value={form.companyName}
                  onChange={set('companyName')}
                  error={errors.companyName}
                />

                <FormInput
                  label="Business license number"
                  placeholder="e.g. LIC-2024-0091"
                  value={form.vacancyLicense}
                  onChange={set('vacancyLicense')}
                  error={errors.vacancyLicense}
                />

                <FormInput
                  label="Industry"
                  as="select"
                  options={[
                    'Event Management',
                    'Marketing',
                    'Retail',
                    'Food & Beverage',
                    'Logistics',
                    'Other',
                  ]}
                  value={form.industry}
                  onChange={set('industry')}
                />
              </>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
                autoComplete="email"
              />

              <FormInput
                label="Phone"
                type="tel"
                placeholder="+20 100 000 0000"
                value={form.phone}
                onChange={set('phone')}
                error={errors.phone}
                autoComplete="tel"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={set('password')}
                error={errors.password}
                autoComplete="new-password"
              />

              <FormInput
                label="Confirm password"
                type="password"
                value={form.confirm}
                onChange={set('confirm')}
                error={errors.confirm}
                autoComplete="new-password"
              />
            </div>

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={set('agree')}
                className="mt-0.5 w-4 h-4 rounded text-navy-600 focus:ring-navy-500"
              />

              <span className="text-navy-700">
                I agree to Shagalny&apos;s{' '}
                <button
                  type="button"
                  className="text-navy-900 font-medium underline"
                >
                  Terms
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  className="text-navy-900 font-medium underline"
                >
                  Privacy Policy
                </button>
                .
              </span>
            </label>

            {errors.agree && (
              <p className="-mt-2 text-xs text-red-600">{errors.agree}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>

            <p className="text-center text-sm text-navy-500 pt-2">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-navy-700 hover:text-navy-900"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

function AccountTypeCard({ active, onClick, icon, title, desc }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-xl border-2 transition ${
        active
          ? 'border-navy-700 bg-navy-50/60 shadow-card'
          : 'border-navy-100 hover:border-navy-300 bg-white'
      }`}
    >
      <span className="text-2xl">{icon}</span>

      <p className="mt-2 font-semibold text-navy-900">{title}</p>

      <p className="text-xs text-navy-500 mt-0.5">{desc}</p>
    </button>
  );
}
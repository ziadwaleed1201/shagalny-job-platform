import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import StatCard from '../components/StatCard';
import RatingStars from '../components/RatingStars';
import { Jobs, Stats } from '../lib/api';
import { normalizeJob } from './JobListing';

const testimonials = [
  { id: 1, name: 'Hana Adel', role: 'University Student, Cairo', avatar: 'HA',
    quote: 'I booked four weekend shifts in my first month on Shagalny. Getting paid in cash on the day was a huge plus.', rating: 5 },
  { id: 2, name: 'Karim Helal', role: 'Event Manager, Pyramid Events', avatar: 'KH',
    quote: 'We hired a 20-person crew in 48 hours for a corporate launch. The verification system saved us a lot of headaches.', rating: 5 },
  { id: 3, name: 'Sara Magdy', role: 'High School Senior, Alexandria', avatar: 'SM',
    quote: 'It felt safe — everything is clear before you accept a job. My parents were comfortable with me applying.', rating: 4 },
];

export default function LandingPage() {
  const [stats, setStats] = useState({ verifiedCompanies: 640, availableShifts: 1300, citiesCovered: 14, successfulHires: 9300 });
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    Stats.platform().then((s) => setStats((cur) => ({ ...cur, ...s }))).catch(() => {});
    Jobs.list({ sort: 'recent' }).then((js) => setFeatured(js.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div>
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-navy-50 via-white to-accent-50">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-navy-100 blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-accent-100 blur-3xl animate-pulse-slow" />
        </div>

        <div className="section relative py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <span className="chip bg-accent-50 text-accent-600 font-semibold mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
              Trusted by {stats.successfulHires.toLocaleString()}+ workers in Egypt
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-navy-900 leading-[1.1]">
              Find Trusted Part-Time Jobs in Egypt
            </h1>
            <p className="mt-5 text-lg text-navy-600 leading-relaxed max-w-xl">
              Shagalny connects verified companies with students and youth for temporary jobs and shifts.
              Clear pay, real companies, fast hiring — no hidden surprises.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/jobs" className="btn-primary text-base px-7 py-3">
                Find Jobs
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to="/register" className="btn-accent text-base px-7 py-3">Post a Job</Link>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {['YA','MS','OH','HA'].map((a, i) => (
                  <div key={a} className={`w-9 h-9 rounded-full grid place-items-center text-xs font-bold text-white ring-2 ring-white ${['bg-navy-700','bg-accent-500','bg-success-600','bg-navy-500'][i]}`}>{a}</div>
                ))}
              </div>
              <div className="text-sm text-navy-600">
                <div className="font-semibold text-navy-900">Join thousands of students</div>
                <div className="text-xs">earning across Cairo, Giza & Alexandria</div>
              </div>
            </div>
          </div>

          <div className="relative animate-slide-up">
            {featured[0] ? (
              <div className="card p-6 max-w-md lg:ml-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-navy-400 uppercase font-semibold">Featured shift</p>
                    <h3 className="text-lg font-bold text-navy-900">{featured[0].title}</h3>
                  </div>
                  <span className="chip bg-success-50 text-success-700">Verified</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <Field icon="💰" k="Pay" v={`${featured[0].salary} EGP`} />
                  <Field icon="📍" k="Location" v={featured[0].location} />
                  <Field icon="📅" k="Date" v={new Date(featured[0].shiftDate).toLocaleDateString()} />
                  <Field icon="⏰" k="Hours" v={`${featured[0].duration}h`} />
                </div>
                <Link to={`/jobs/${featured[0]._id}`} className="btn-primary w-full">Apply in 1 minute</Link>
              </div>
            ) : (
              <div className="card p-6 max-w-md lg:ml-auto animate-pulse">
                <div className="h-6 bg-navy-100 rounded w-2/3 mb-4" />
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[1,2,3,4].map((i) => <div key={i} className="h-12 bg-navy-50 rounded" />)}
                </div>
                <div className="h-10 bg-navy-100 rounded" />
              </div>
            )}
            <div className="hidden lg:block absolute -bottom-4 -left-4 card p-4 max-w-[220px] shadow-soft animate-slide-up">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-full bg-success-100 text-success-700 grid place-items-center">✓</span>
                <span className="font-semibold text-sm">Paid same day</span>
              </div>
              <p className="text-xs text-navy-500">Most event shifts pay in cash on the day of work.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section py-12 -mt-6 relative z-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="🏢" value={`${stats.verifiedCompanies}+`} label="Verified Companies" accent="navy" />
          <StatCard icon="📅" value={`${stats.availableShifts}+`} label="Available Shifts" accent="accent" />
          <StatCard icon="📍" value={stats.citiesCovered} label="Cities Covered" accent="success" />
          <StatCard icon="🤝" value={`${stats.successfulHires.toLocaleString()}+`} label="Successful Hires" accent="amber" />
        </div>
      </section>

      <section className="section py-16">
        <header className="text-center max-w-2xl mx-auto mb-12">
          <span className="chip bg-navy-50 text-navy-700">How it works</span>
          <h2 className="text-3xl md:text-4xl mt-3">Simple. Safe. Fast.</h2>
          <p className="mt-3 text-navy-600">Whether you're hiring or looking for a shift, Shagalny gets you there in 5 clear steps.</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card p-6 lg:p-8 hover:shadow-soft transition">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-12 rounded-xl bg-accent-100 text-accent-600 grid place-items-center text-xl">🎓</span>
              <h3 className="text-xl font-bold">For Job Seekers</h3>
            </div>
            <ol className="space-y-4">
              {[
                ['Register','Create your free profile in 2 minutes.'],
                ['Verify','Upload your National ID for verified status.'],
                ['Apply','Browse and apply to jobs that fit your schedule.'],
                ['Attend','Show up to your shift on time.'],
                ['Get paid & rated','Cash on the day. Build your rating for future jobs.'],
              ].map(([title, desc], i) => (
                <li key={title} className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-navy-50 text-navy-700 grid place-items-center font-bold text-sm">{i+1}</span>
                  <div>
                    <h4 className="font-semibold text-navy-900">{title}</h4>
                    <p className="text-sm text-navy-600">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="card p-6 lg:p-8 hover:shadow-soft transition">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-12 rounded-xl bg-navy-100 text-navy-700 grid place-items-center text-xl">🏢</span>
              <h3 className="text-xl font-bold">For Companies</h3>
            </div>
            <ol className="space-y-4">
              {[
                ['Create profile','Set up your company page.'],
                ['Verify business','Submit your commercial registration.'],
                ['Post job','Add salary, location, shift details — go live in minutes.'],
                ['Review applicants','See verified profiles and ratings.'],
                ['Hire workers','Confirm hires and rate them after the shift.'],
              ].map(([title, desc], i) => (
                <li key={title} className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-success-50 text-success-700 grid place-items-center font-bold text-sm">{i+1}</span>
                  <div>
                    <h4 className="font-semibold text-navy-900">{title}</h4>
                    <p className="text-sm text-navy-600">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section py-16">
        <header className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <span className="chip bg-accent-50 text-accent-600">Hiring now</span>
            <h2 className="text-3xl mt-3">Featured Jobs</h2>
            <p className="text-navy-600 mt-2">Fresh shifts posted by verified companies.</p>
          </div>
          <Link to="/jobs" className="btn-outline text-sm">See all jobs</Link>
        </header>
        <div className="grid md:grid-cols-2 gap-5">
          {featured.length === 0 ? (
            <p className="text-navy-500 col-span-2">Loading jobs...</p>
          ) : (
            featured.map((job) => <JobCard key={job._id} job={normalizeJob(job)} />)
          )}
        </div>
      </section>

      <section className="section py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="chip bg-success-50 text-success-700">Trust & Safety</span>
            <h2 className="text-3xl mt-3">A platform built for safer hiring.</h2>
            <p className="mt-3 text-navy-600 text-lg leading-relaxed">
              Every company is verified. Every job has clear pay, location, and hours.
              And every user can rate and report — so the bad actors stay out.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                ['Verified companies only','We check business registration before any job goes live.'],
                ['ID-verified workers','National ID verification builds trust on both sides.'],
                ['Transparent pay & hours','No hidden fees. No surprises.'],
                ['Two-way ratings','Workers rate companies. Companies rate workers.'],
                ['One-tap reporting','Anyone can flag a suspicious job. Admin responds in 24h.'],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-success-100 text-success-700 grid place-items-center mt-0.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div>
                    <h4 className="font-semibold text-navy-900">{title}</h4>
                    <p className="text-sm text-navy-600">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6 bg-navy-900 text-white">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-accent-500 grid place-items-center">🛡</span>
              <h3 className="text-xl font-bold text-white">Worker Protection</h3>
            </div>
            <p className="text-navy-200">
              We follow Egyptian labor regulations for minors. Workers under 18 only see jobs with safe hours and conditions.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-navy-700/60 rounded-xl p-4">
                <p className="text-2xl font-bold">24h</p>
                <p className="text-xs text-navy-200 mt-1">Report response time</p>
              </div>
              <div className="bg-navy-700/60 rounded-xl p-4">
                <p className="text-2xl font-bold">99%</p>
                <p className="text-xs text-navy-200 mt-1">Verified job listings</p>
              </div>
              <div className="bg-navy-700/60 rounded-xl p-4">
                <p className="text-2xl font-bold">48h</p>
                <p className="text-xs text-navy-200 mt-1">Company verification SLA</p>
              </div>
              <div className="bg-navy-700/60 rounded-xl p-4">
                <p className="text-2xl font-bold">16+</p>
                <p className="text-xs text-navy-200 mt-1">Age limit, no exceptions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section py-16">
        <header className="text-center max-w-2xl mx-auto mb-10">
          <span className="chip bg-navy-50 text-navy-700">What our users say</span>
          <h2 className="text-3xl mt-3">Real stories from the platform.</h2>
        </header>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <article key={t.id} className="card p-6 hover:shadow-soft transition">
              <RatingStars rating={t.rating} showNumber={false} size="md" />
              <p className="mt-3 text-navy-700 leading-relaxed">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3 pt-4 border-t border-navy-100">
                <div className="w-10 h-10 rounded-full bg-navy-700 text-white grid place-items-center font-bold text-sm">{t.avatar}</div>
                <div>
                  <p className="font-semibold text-navy-900 text-sm">{t.name}</p>
                  <p className="text-xs text-navy-500">{t.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-navy-800 to-navy-900 text-white p-8 md:p-14 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Ready to start earning?</h2>
          <p className="mt-3 text-navy-200 max-w-xl mx-auto">
            Create your free profile in under 2 minutes. Your first shift could be this weekend.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/register" className="btn-accent text-base px-8 py-3">Create Free Account</Link>
            <Link to="/jobs" className="btn-outline border-white text-white hover:bg-white/10 text-base px-8 py-3">Browse Jobs</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Field({ icon, k, v }) {
  return (
    <div className="bg-navy-50/60 rounded-lg p-2.5">
      <p className="text-[11px] text-navy-500">{icon} {k}</p>
      <p className="font-semibold text-navy-900 text-sm">{v}</p>
    </div>
  );
}

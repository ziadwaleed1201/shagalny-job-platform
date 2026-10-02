import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatCard from '../components/StatCard';
// Stats inlined so this page never depends on an external data file.
const platformStats = {
  verifiedEmployers: 640,
  availableShifts: 1300,
  citiesCovered: 14,
  successfulHires: 9300,
};

export default function About() {
  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-50 via-white to-accent-50 border-b border-navy-100">
        <div className="section py-16 md:py-20 max-w-4xl">
          <span className="chip bg-navy-50 text-navy-700">About Shagalny</span>
          <h1 className="text-4xl md:text-5xl mt-3 font-extrabold">
            We're building the safest way for Egyptian youth to find part-time work.
          </h1>
          <p className="mt-5 text-lg text-navy-600 leading-relaxed">
            Shagalny was born from a simple observation: in Cairo, Giza, and Alexandria, thousands of students want
            extra income — and thousands of businesses need flexible workers for events, campaigns, and shifts.
            But the two sides have never had a single, trusted place to meet.
          </p>
        </div>
      </section>

      {/* What is Shagalny */}
      <section className="section py-16 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl">What Shagalny is.</h2>
          <p className="mt-4 text-navy-700 leading-relaxed">
            Shagalny is a part-time job platform built for Egypt. It connects verified employers — marketing agencies,
            event planners, retailers, and small businesses — with students and youth aged 16 and up who are looking
            for shifts, micro-jobs, and short projects.
          </p>
          <p className="mt-3 text-navy-700 leading-relaxed">
            Every job lists its pay, hours, and location up front. Every employer is verified. And every transaction
            is rated by both sides, so trust compounds over time.
          </p>
        </div>
        <div className="card p-6 bg-navy-900 text-white">
          <p className="text-accent-300 text-sm font-semibold uppercase tracking-wider">Our promise</p>
          <ul className="mt-4 space-y-3 text-navy-100">
            <li className="flex gap-3"><span>•</span> Real jobs from real companies — only.</li>
            <li className="flex gap-3"><span>•</span> Pay, hours, and location are never hidden.</li>
            <li className="flex gap-3"><span>•</span> Workers under 18 are protected by Egyptian labor law.</li>
            <li className="flex gap-3"><span>•</span> Free for job seekers, always.</li>
          </ul>
        </div>
      </section>

      {/* Why created */}
      <section className="section py-16 bg-navy-50/40 rounded-3xl mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-4xl">
          <h2 className="text-3xl">Why we created Shagalny.</h2>
          <p className="mt-4 text-navy-700 leading-relaxed">
            Talk to any student in Cairo and you'll hear the same story. They want to earn — maybe to help pay for university,
            maybe just to gain experience — but every avenue is broken in some way.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-10">
          <Problem
            icon="❓"
            title="No trust"
            desc="Most listings are on closed Facebook groups, where nobody knows if the employer is real or fake."
          />
          <Problem
            icon="💸"
            title="Hidden terms"
            desc="Pay rates, working hours, and conditions only get clarified after you show up — sometimes never."
          />
          <Problem
            icon="🐢"
            title="Slow hiring"
            desc="Event companies need 20 workers by Thursday but spend days chasing replies in DMs."
          />
        </div>
      </section>

      {/* Solution */}
      <section className="section py-16 grid lg:grid-cols-2 gap-10 items-center">
        <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
          <StatCard icon="🏢" value={`${platformStats.verifiedEmployers}+`} label="Verified employers" accent="navy" />
          <StatCard icon="📅" value={`${platformStats.availableShifts}+`} label="Open shifts" accent="accent" />
          <StatCard icon="🤝" value={`${platformStats.successfulHires}+`} label="Successful hires" accent="success" />
          <StatCard icon="📍" value={platformStats.citiesCovered} label="Cities covered" accent="amber" />
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="text-3xl">The Shagalny solution.</h2>
          <p className="mt-4 text-navy-700 leading-relaxed">
            We verify every employer before a single job goes public. We make every listing structured — title, pay,
            hours, location, requirements — so there are no surprises. And we let both sides rate each other after every shift,
            so good behavior is rewarded and bad behavior gets weeded out fast.
          </p>
          <p className="mt-3 text-navy-700 leading-relaxed">
            For employers, that means filling 10 event spots in 24 hours. For students, it means earning safely
            without falling for a scam.
          </p>
        </div>
      </section>

      {/* Focus areas */}
      <section className="section py-16">
        <h2 className="text-3xl text-center">What we focus on.</h2>
        <p className="text-center text-navy-500 mt-2 max-w-xl mx-auto">
          Three things, done well, instead of trying to be everything.
        </p>
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          <Focus
            icon="🎓"
            title="Youth Employment"
            desc="We exist for students and young workers aged 16+ — the segment most underserved by traditional job boards."
          />
          <Focus
            icon="🛡"
            title="Trust"
            desc="Verification, ratings, and clear job details. We'd rather have fewer jobs than fake ones."
          />
          <Focus
            icon="⚡"
            title="Speed"
            desc="A part-time shift booked in minutes — not days. That's the bar."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="section pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-navy-800 to-navy-900 text-white p-8 md:p-14 text-center">
          <h2 className="text-3xl md:text-4xl text-white font-extrabold">Want to be part of it?</h2>
          <p className="mt-3 text-navy-200 max-w-xl mx-auto">
            Sign up as a job seeker or post your first job in less than 5 minutes.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/register" className="btn-accent text-base px-8 py-3">Create Account</Link>
            <Link to="/jobs" className="btn-outline border-white text-white hover:bg-white/10 text-base px-8 py-3">
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Problem({ icon, title, desc }) {
  return (
    <div className="card p-6">
      <div className="text-3xl">{icon}</div>
      <h4 className="font-bold text-navy-900 mt-3">{title}</h4>
      <p className="text-sm text-navy-600 mt-1.5 leading-relaxed">{desc}</p>
    </div>
  );
}

function Focus({ icon, title, desc }) {
  return (
    <div className="card p-6 hover:shadow-soft transition">
      <div className="w-12 h-12 rounded-xl bg-accent-100 text-accent-600 grid place-items-center text-xl">
        {icon}
      </div>
      <h4 className="font-bold text-navy-900 mt-4 text-lg">{title}</h4>
      <p className="text-sm text-navy-600 mt-2 leading-relaxed">{desc}</p>
    </div>
  );
}

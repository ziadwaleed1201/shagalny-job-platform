import { Link } from 'react-router-dom';

// Footer — global footer with quick links and contact info.
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy-900 text-navy-100 mt-16">
      <div className="section py-12 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-accent-500 text-white grid place-items-center font-bold">
              S
            </span>
            <span className="text-xl font-bold text-white">
              Shagalny<span className="text-accent-400">.</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-navy-200 leading-relaxed">
            The trusted part-time job platform connecting Egyptian youth with verified employers.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">For Job Seekers</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/jobs" className="hover:text-white transition">Browse Jobs</Link></li>
            <li><Link to="/register" className="hover:text-white transition">Create Account</Link></li>
            <li><Link to="/dashboard/seeker" className="hover:text-white transition">My Dashboard</Link></li>
            <li><Link to="/support" className="hover:text-white transition">Help Center</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">For Companies</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/post-job" className="hover:text-white transition">Post a Job</Link></li>
            <li><Link to="/dashboard/employer" className="hover:text-white transition">Company Dashboard</Link></li>
            <li><Link to="/about" className="hover:text-white transition">Why Shagalny</Link></li>
            <li><Link to="/support" className="hover:text-white transition">Contact Sales</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>Cairo, Egypt</li>
            <li>hello@shagalny.eg</li>
            <li>+20 100 000 0000</li>
            <li className="pt-2 flex gap-3">
              <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full bg-navy-700 hover:bg-navy-600 grid place-items-center">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.6 9.87v-6.98H7.9V12h2.5V9.8c0-2.47 1.47-3.84 3.72-3.84 1.08 0 2.21.2 2.21.2v2.43h-1.25c-1.23 0-1.61.76-1.61 1.55V12h2.74l-.44 2.89h-2.3v6.98A10 10 0 0 0 22 12Z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full bg-navy-700 hover:bg-navy-600 grid place-items-center">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.22.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.05.42 2.22.06 1.25.07 1.62.07 4.81s0 3.56-.07 4.81c-.05 1.17-.25 1.8-.42 2.22-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.05.37-2.22.42-1.25.06-1.62.07-4.81.07s-3.56 0-4.81-.07c-1.17-.05-1.8-.25-2.22-.42a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.17-.42-.37-1.05-.42-2.22C2.2 15.6 2.2 15.23 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.8.42-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.05-.37 2.22-.42C8.44 2.2 8.81 2.2 12 2.2Zm0 1.8c-3.16 0-3.5 0-4.74.07-.96.04-1.48.2-1.83.34-.46.18-.8.4-1.15.74-.34.34-.56.69-.74 1.15-.13.35-.3.87-.34 1.83C3.13 8.5 3.13 8.84 3.13 12s0 3.5.07 4.74c.04.96.2 1.48.34 1.83.18.46.4.8.74 1.15.34.34.69.56 1.15.74.35.13.87.3 1.83.34C8.5 20.87 8.84 20.87 12 20.87s3.5 0 4.74-.07c.96-.04 1.48-.2 1.83-.34.46-.18.8-.4 1.15-.74.34-.34.56-.69.74-1.15.13-.35.3-.87.34-1.83.07-1.24.07-1.58.07-4.74s0-3.5-.07-4.74c-.04-.96-.2-1.48-.34-1.83a3.06 3.06 0 0 0-.74-1.15 3.06 3.06 0 0 0-1.15-.74c-.35-.13-.87-.3-1.83-.34C15.5 4 15.16 4 12 4Zm0 3.05a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Zm5.4-2.05a1.16 1.16 0 1 1 0 2.32 1.16 1.16 0 0 1 0-2.32Z"/></svg>
              </a>
              <a href="#" aria-label="X" className="w-8 h-8 rounded-full bg-navy-700 hover:bg-navy-600 grid place-items-center">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z"/></svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-700">
        <div className="section py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-navy-300">
          <p>© {year} Shagalny. All rights reserved.</p>
          <p>Built for trust, safety, and youth employment in Egypt.</p>
        </div>
      </div>
    </footer>
  );
}

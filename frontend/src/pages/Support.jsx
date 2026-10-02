import { useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FormInput from '../components/FormInput';
import DashboardCard from '../components/DashboardCard';
import { Support as SupportApi } from '../lib/api';

const faqs = [
  { q: 'Who can register on Shagalny?', a: 'Anyone aged 16 or older living in Egypt can register as a job seeker. Companies must be a registered business or a verified individual.' },
  { q: 'How are companies verified?', a: 'Companies submit a commercial registration and tax card. Our team reviews each application within 48 hours before allowing them to publish jobs publicly.' },
  { q: 'How do I get paid?', a: 'Payment terms are set by the company and shown on each job listing. Most shifts pay in cash on the same day; longer projects may pay weekly via bank transfer.' },
  { q: 'What if I find a suspicious job?', a: 'Every job page has a "Report" button. Reports are reviewed by our admin team and suspicious listings are removed within 24 hours.' },
  { q: 'Is there a fee for job seekers?', a: 'No. Shagalny is completely free for job seekers. Companies pay a small service fee per successful hire.' },
  { q: 'Can minors (under 18) work through Shagalny?', a: 'Yes, from age 16, but only for jobs that comply with Egyptian labor law for minors — limited hours, no late shifts, and no hazardous work.' },
];

// Layla's keyword-based replies — no API key needed, tuned to how Shagalny works.
function laylaReply(input) {
  const t = (input || '').toLowerCase();
  const has = (...keys) => keys.some((k) => t.includes(k));

  if (has('salam', 'hi', 'hello', 'hey', 'مرحبا', 'السلام', 'اهلا'))
    return "Hi! I can help with applying to jobs, payments, verification, posting jobs, ratings, and your profile. What do you need?";
  if (has('apply', 'get a job', 'تقديم', 'اشتغل'))
    return "To apply: open Find Jobs, pick a job, and tap Apply Now. You'll need a job seeker account, and you can track everything under My Applications in your dashboard.";
  if (has('escrow', 'payment', 'pay', 'paid', 'salary', 'فلوس', 'دفع', 'راتب'))
    return "Payments are protected by escrow: the company pays up front, Shagalny holds the funds, and they're released to your payout card once the job is marked complete. You can follow it under Payments in your dashboard.";
  if (has('verif', 'verified', 'توثيق', 'تحقق'))
    return "Companies are verified by our admin team before their jobs go public — they submit a commercial registration and tax card, reviewed within 48 hours. Verified companies show a green Verified badge.";
  if (has('post', 'hire', 'employer', 'company', 'وظيفة', 'اعلان'))
    return "Companies post a job from the Company dashboard → Post a New Job: fill in the details, pin the location on the map, and submit. Our admin team approves it before it goes public.";
  if (has('rating', 'review', 'rate', 'stars', 'تقييم'))
    return "After a job is completed, the worker and the company rate each other from 1 to 5 stars. Your average rating shows on your profile and is visible to companies.";
  if (has('cv', 'resume', 'profile', 'photo', 'skill', 'experience', 'سيرة', 'بروفايل'))
    return "Go to your dashboard → My Profile to upload a photo and CV and add your experience and skills. A complete profile makes companies more likely to hire you.";
  if (has('card', 'visa', 'mastercard', 'فيزا', 'كارت'))
    return "You can add a payout card under Payment Cards in your dashboard — that's where released payments are sent.";
  if (has('report', 'scam', 'suspicious', 'fake', 'fraud', 'نصب', 'احتيال'))
    return "If a job looks suspicious, open it and tap Report. Our admin team removes bad listings within 24 hours. Never pay a company to apply — payments only ever flow from company to worker.";
  if (has('fee', 'cost', 'free', 'price', 'مجاني', 'سعر'))
    return "Shagalny is completely free for job seekers. Companies pay a small service fee per successful hire.";
  if (has('minor', 'under 18', 'age', ' 16', ' 17', 'قاصر', 'سن'))
    return "Anyone aged 16+ in Egypt can join. For under-18s, only jobs that follow Egyptian labor law for minors are allowed — limited hours, no late shifts, no hazardous work.";
  if (has('human', 'agent', 'call', 'phone', 'contact', 'hotline', 'اتصال', 'رقم'))
    return "You can reach a human on our hotline +20 100 000 0000 (9am–9pm) or email hello@shagalny.eg. You can also submit a ticket from the tab above and we'll reply within 24 hours.";
  if (has('thank', 'شكرا'))
    return "You're welcome! Anything else I can help with?";

  return "I'm not totally sure I caught that. I can help with: applying to jobs, payments & escrow, verification, posting a job, ratings, your profile/CV, or reporting a job. You can also submit a ticket from the tab above and a human agent will follow up.";
}

export default function Support() {
  const [tab, setTab] = useState('chat');
  const [messages, setMessages] = useState([
    { from: 'agent', text: "Hi! 👋 I'm Layla from Shagalny Support. How can I help today?" },
  ]);
  const [draft, setDraft] = useState('');

  function send(preset) {
    const text = (preset ?? draft).trim();
    if (!text) return;
    setMessages((cur) => [...cur, { from: 'me', text }]);
    setDraft('');
    setTimeout(() => {
      setMessages((cur) => [...cur, { from: 'agent', text: laylaReply(text) }]);
    }, 600);
  }

  return (
    <div>
      <Navbar />
      <div className="section py-8 animate-fade-in">
        <header className="mb-6 text-center max-w-2xl mx-auto">
          <span className="chip bg-navy-50 text-navy-700">Support</span>
          <h1 className="text-3xl md:text-4xl mt-3">We're here to help.</h1>
          <p className="text-navy-500 mt-2">Chat, send a ticket, or browse our FAQ. Most replies arrive in under an hour.</p>
        </header>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Channel icon="📞" title="Hotline" subtitle="Call us 9am – 9pm" value="+20 100 000 0000" highlight />
          <Channel icon="✉" title="Email" subtitle="Replies within 24h" value="hello@shagalny.eg" />
          <Channel icon="💬" title="Live Chat" subtitle="Average wait: 3 min" value="Start chat below" />
        </div>

        <div className="flex flex-wrap gap-2 mb-4 border-b border-navy-100">
          {[['chat','💬 Live chat'],['ticket','🎫 Submit ticket'],['faq','❓ FAQ'],['report','⚠ Report a problem']].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === id ? 'border-navy-700 text-navy-900' : 'border-transparent text-navy-500 hover:text-navy-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'chat' && (
          <DashboardCard>
            <div className="grid lg:grid-cols-[1fr_280px] gap-6">
              <div className="border border-navy-100 rounded-2xl flex flex-col h-[480px]">
                <div className="px-4 py-3 border-b border-navy-100 flex items-center gap-3 bg-navy-50/40">
                  <div className="w-9 h-9 rounded-full bg-navy-700 text-white grid place-items-center font-bold text-sm">L</div>
                  <div>
                    <p className="font-semibold text-sm">Layla · Support Agent</p>
                    <p className="text-xs text-success-600">● Online now</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        m.from === 'me' ? 'bg-navy-700 text-white rounded-br-md' : 'bg-navy-50 text-navy-800 rounded-bl-md'
                      }`}>{m.text}</div>
                    </div>
                  ))}
                </div>
                <div className="px-3 pt-2 flex flex-wrap gap-2">
                  {['How do I apply?', 'How do payments work?', 'How do I get verified?', 'Report a job'].map((q) => (
                    <button key={q} type="button" onClick={() => send(q)}
                      className="text-xs px-3 py-1.5 rounded-full bg-navy-50 text-navy-700 hover:bg-navy-100 transition">
                      {q}
                    </button>
                  ))}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-navy-100 p-3 flex gap-2 mt-2">
                  <input className="input flex-1" placeholder="Type your message..."
                    value={draft} onChange={(e) => setDraft(e.target.value)} />
                  <button type="submit" className="btn-primary text-sm">Send</button>
                </form>
              </div>

              <div className="space-y-3">
                <div className="card p-4 bg-navy-50/40">
                  <p className="font-semibold text-sm text-navy-900">Before you write</p>
                  <ul className="mt-2 space-y-1 text-sm text-navy-600 list-disc pl-4">
                    <li>Have your job/order ID ready</li>
                    <li>Briefly describe the issue</li>
                    <li>Screenshots help us move faster</li>
                  </ul>
                </div>
                <div className="card p-4 bg-accent-50/60">
                  <p className="font-semibold text-sm">Urgent safety issue?</p>
                  <p className="text-sm text-navy-700 mt-1">For immediate safety concerns, call our hotline directly.</p>
                </div>
              </div>
            </div>
          </DashboardCard>
        )}

        {tab === 'ticket' && <TicketForm />}
        {tab === 'faq' && <FaqSection />}
        {tab === 'report' && <ReportForm />}
      </div>
      <Footer />
    </div>
  );
}

function Channel({ icon, title, subtitle, value, highlight }) {
  return (
    <div className={`card p-5 hover:shadow-soft transition ${highlight ? 'border-accent-200 bg-accent-50/40' : ''}`}>
      <div className="text-2xl">{icon}</div>
      <p className="font-semibold text-navy-900 mt-2">{title}</p>
      <p className="text-xs text-navy-500">{subtitle}</p>
      <p className={`mt-2 font-bold ${highlight ? 'text-accent-600' : 'text-navy-800'}`}>{value}</p>
    </div>
  );
}

function TicketForm() {
  const [form, setForm] = useState({ category: 'general', subject: '', message: '', fromName: '', fromEmail: '' });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await SupportApi.submitTicket(form);
      toast.success('Ticket submitted!');
      setSent(true);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not submit ticket.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) return (
    <DashboardCard>
      <div className="text-center py-10 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-success-100 text-success-700 grid place-items-center mx-auto text-2xl">✓</div>
        <h2 className="mt-4 text-xl font-bold">Ticket submitted</h2>
        <p className="text-navy-500 mt-1">We'll reach out within 24 hours.</p>
      </div>
    </DashboardCard>
  );

  return (
    <DashboardCard title="Submit a support ticket">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormInput label="Your name" value={form.fromName} onChange={(e) => setForm({...form, fromName: e.target.value})} required />
          <FormInput label="Email" type="email" value={form.fromEmail} onChange={(e) => setForm({...form, fromEmail: e.target.value})} required />
        </div>
        <FormInput label="Category" as="select"
          options={[
            { value: 'general', label: 'General question' },
            { value: 'verification', label: 'Verification' },
            { value: 'payment', label: 'Payment' },
            { value: 'job', label: 'Issue with a job/shift' },
            { value: 'account', label: 'My account' },
          ]}
          value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} />
        <FormInput label="Subject" placeholder="Short summary..."
          value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} required />
        <FormInput as="textarea" label="Message" placeholder="Tell us what's happening..."
          value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} required />
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Submitting...' : 'Submit ticket'}
        </button>
      </form>
    </DashboardCard>
  );
}

function FaqSection() {
  const [open, setOpen] = useState(null);
  return (
    <DashboardCard title="Frequently Asked Questions">
      <ul className="divide-y divide-navy-100">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <li key={i}>
              <button onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 text-left py-4 hover:bg-navy-50/40 px-2 rounded-lg">
                <span className="font-semibold text-navy-900">{f.q}</span>
                <svg className={`w-5 h-5 text-navy-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {isOpen && <p className="px-2 pb-4 text-navy-600 text-sm leading-relaxed animate-fade-in">{f.a}</p>}
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
}

function ReportForm() {
  const [form, setForm] = useState({ category: 'safety', subject: '', message: '', fromName: '', fromEmail: '' });
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    try {
      await SupportApi.submitTicket({ ...form, subject: form.subject || 'Problem report' });
      toast.success('Report submitted');
      setSent(true);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not submit.');
    }
  }

  if (sent) return (
    <DashboardCard>
      <div className="text-center py-10 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-accent-100 text-accent-600 grid place-items-center mx-auto text-2xl">!</div>
        <h2 className="mt-4 text-xl font-bold">Thanks for letting us know</h2>
        <p className="text-navy-500 mt-1">Our admin team will investigate within 24 hours.</p>
      </div>
    </DashboardCard>
  );

  return (
    <DashboardCard title="Report a problem">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormInput label="Your name" value={form.fromName} onChange={(e) => setForm({...form, fromName: e.target.value})} required />
          <FormInput label="Email" type="email" value={form.fromEmail} onChange={(e) => setForm({...form, fromEmail: e.target.value})} required />
        </div>
        <FormInput label="What's the issue about?" as="select"
          options={[
            { value: 'job', label: 'A job listing' },
            { value: 'safety', label: 'Safety concern' },
            { value: 'account', label: 'My account' },
            { value: 'platform', label: 'A bug on the platform' },
          ]}
          value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} />
        <FormInput as="textarea" label="Tell us what happened" placeholder="The more detail you share, the faster we can help."
          value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} required />
        <button type="submit" className="btn-primary">Submit report</button>
      </form>
    </DashboardCard>
  );
}

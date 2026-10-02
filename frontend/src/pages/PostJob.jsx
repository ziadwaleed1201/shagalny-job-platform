import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FormInput from '../components/FormInput';
import LocationPicker from '../components/LocationPicker';
import { DatePicker } from '../components/Calendar';
import { Jobs } from '../lib/api';

const initialForm = {
  title: '', jobType: 'Event', location: '', city: 'Cairo',
  salary: '', salaryUnit: 'shift', shiftDate: '', shiftTime: '',
  workersNeeded: 1, description: '', requirements: '',
  instructions: '', contactMethod: 'In-app messaging',
  latitude: null, longitude: null,
};

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Job title is required.';
    if (!form.location.trim()) e.location = 'Location is required.';
    if (!form.salary || Number(form.salary) <= 0) e.salary = 'Enter a valid salary amount.';
    if (!form.shiftDate) e.shiftDate = 'Pick a date.';
    if (!form.shiftTime.trim()) e.shiftTime = 'Specify the shift time.';
    if (!form.description.trim() || form.description.trim().length < 30)
      e.description = 'Description should be at least 30 characters.';
    if (!form.requirements.trim()) e.requirements = 'List at least one requirement.';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      const requirements = form.requirements.split('\n').map((s) => s.trim()).filter(Boolean);
      const tags = [form.jobType, form.city];
      await Jobs.create({ ...form, salary: Number(form.salary), workersNeeded: Number(form.workersNeeded), requirements, tags });
      toast.success('Job submitted for review!');
      setSuccess(true);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not post job.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div>
        <Navbar />
        <div className="section py-20 max-w-xl mx-auto text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-success-100 text-success-700 grid place-items-center text-2xl mx-auto">✓</div>
          <h1 className="text-2xl font-extrabold mt-5">Job submitted for review</h1>
          <p className="text-navy-500 mt-2">Our admin team reviews every job post for quality and safety. You'll be notified once it's live.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/dashboard/employer" className="btn-primary text-sm">Back to dashboard</Link>
            <button onClick={() => { setSuccess(false); setForm(initialForm); }} className="btn-outline text-sm">Post another job</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="section py-8 max-w-3xl mx-auto animate-fade-in">
        <header className="mb-6">
          <Link to="/dashboard/employer" className="text-sm text-navy-500 hover:text-navy-700">← Back to dashboard</Link>
          <h1 className="text-3xl font-extrabold mt-2">Post a job</h1>
          <p className="text-navy-500 mt-1">Clear details get hired faster.</p>
        </header>

        <form className="card p-6 space-y-5" onSubmit={handleSubmit} noValidate>
          <FormInput label="Job title" placeholder="e.g. Event Hostess for Tech Conference"
            value={form.title} onChange={set('title')} error={errors.title} />

          <div className="grid sm:grid-cols-2 gap-4">
            <FormInput label="Job type" as="select"
              options={['Event','Retail','Marketing','Food & Beverage','Remote','Other']}
              value={form.jobType} onChange={set('jobType')} />
            <FormInput label="City" as="select"
              options={['Cairo','Giza','Alexandria','Mansoura','Suez','Remote']}
              value={form.city} onChange={set('city')} />
          </div>

          <FormInput label="Specific location" placeholder="e.g. New Cairo, Mall of Egypt"
            value={form.location} onChange={set('location')} error={errors.location} />

          <div>
            <label className="label">Pin the exact location on the map</label>
            <LocationPicker
              lat={form.latitude}
              lng={form.longitude}
              onPick={(la, ln) => setForm((f) => ({ ...f, latitude: la, longitude: ln }))}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <FormInput label="Salary (EGP)" type="number" min="0" placeholder="800"
              value={form.salary} onChange={set('salary')} error={errors.salary} />
            <FormInput label="Pay unit" as="select"
              options={[
                { value: 'shift', label: 'per shift' },
                { value: 'hour', label: 'per hour' },
                { value: 'day', label: 'per day' },
                { value: 'project', label: 'per project' },
              ]}
              value={form.salaryUnit} onChange={set('salaryUnit')} />
            <FormInput label="Workers needed" type="number" min="1"
              value={form.workersNeeded} onChange={set('workersNeeded')} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Shift date</label>
              <DatePicker
                value={form.shiftDate}
                onChange={(d) => { setForm((f) => ({ ...f, shiftDate: d })); setErrors((er) => ({ ...er, shiftDate: '' })); }}
                min={new Date().toLocaleDateString('en-CA')}
              />
              {errors.shiftDate && <p className="mt-1 text-xs text-red-600">{errors.shiftDate}</p>}
            </div>
            <FormInput label="Shift time" placeholder="e.g. 09:00 - 17:00"
              value={form.shiftTime} onChange={set('shiftTime')} error={errors.shiftTime} />
          </div>

          <FormInput as="textarea" label="Job description"
            placeholder="Describe what the worker will be doing..."
            value={form.description} onChange={set('description')} error={errors.description}
            hint="Be specific about duties." />

          <FormInput as="textarea" label="Requirements"
            placeholder="One per line. e.g. Age 18+, Fluent English"
            value={form.requirements} onChange={set('requirements')} error={errors.requirements} />

          <FormInput as="textarea" label="Safety & instructions (optional)"
            placeholder="Training, dress code, transportation, safety info..."
            value={form.instructions} onChange={set('instructions')} />

          <FormInput label="Preferred contact method" as="select"
            options={['In-app messaging','Phone call','WhatsApp']}
            value={form.contactMethod} onChange={set('contactMethod')} />

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
            <strong>Note:</strong> Jobs open to workers under 18 must comply with Egyptian labor law — limited hours, no late shifts, no hazardous work.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-accent flex-1">
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </button>
            <Link to="/dashboard/employer" className="btn-ghost flex-1 text-center">Cancel</Link>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}

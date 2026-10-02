// Seed Shagalny with consistent test data that matches the CURRENT models.
// Run from the Backend folder:  node seed.js
// It clears the core collections first, so it is safe to re-run.
require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const JobSeeker = require('./models/JobSeeker');
const Vacancy = require('./models/Vacancy');
const Admin = require('./models/Admin');
const Moderator = require('./models/Moderator');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Card = require('./models/Card');
const Review = require('./models/Review');
const Notification = require('./models/Notification');
const SavedJob = require('./models/SavedJob');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shagalny';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected. Clearing ALL collections (including payment data)...');
  const existing = await mongoose.connection.db.listCollections().toArray();
  for (const c of existing) {
    await mongoose.connection.db.collection(c.name).deleteMany({});
    console.log('  cleared: ' + c.name);
  }

  // --- Staff accounts ---
  // Passwords are passed in plain text on purpose: the User model's pre-save
  // hook hashes them (which is why we use User.create, not insertMany).
  const adminUser = await User.create({
    fullName: 'Site Admin', email: 'admin@shagalny.eg', password: 'admin1234',
    phone: '+201000000001', role: 'admin', accountStatus: 'active',
  });
  await Admin.create({ user: adminUser._id });

  const modUser = await User.create({
    fullName: 'Site Moderator', email: 'mod@shagalny.eg', password: 'mod12345',
    phone: '+201000000002', role: 'moderator', accountStatus: 'active',
  });
  await Moderator.create({ user: modUser._id });

  // --- Companies (vacancy accounts), pre-verified so their jobs can go public ---
  const companyDefs = [
    { name: 'Karim Helal', email: 'karim@pyramidevents.eg', phone: '+201000000010', vacancyName: 'Pyramid Events Co.', license: 'LIC-2024-0091', rating: 4.7 },
    { name: 'Nadia Farouk', email: 'nadia@nilemart.eg', phone: '+201000000011', vacancyName: 'NileMart Retail', license: 'LIC-2024-0152', rating: 4.4 },
    { name: 'Sarah Mokha', email: 'sarah@cafemokha.eg', phone: '+201000000012', vacancyName: 'Cafe Mokha', license: 'LIC-2024-0233', rating: 4.6 },
  ];
  const vacancies = [];
  for (const c of companyDefs) {
    const u = await User.create({
      fullName: c.name, email: c.email, password: 'password123',
      phone: c.phone, role: 'vacancy', accountStatus: 'active',
    });
    vacancies.push(await Vacancy.create({
      user: u._id, vacancyName: c.vacancyName, vacancyLicense: c.license,
      vacancyStatus: 'verified', rating: c.rating,
    }));
  }

  // --- Job seekers ---
  const seekerDefs = [
    { name: 'Youssef Ahmed', email: 'youssef@example.com', phone: '+201000000020', nationalId: '30001011200011', rating: 4.8, about: 'Reliable event hostess with one year of experience.', skills: ['English', 'Customer service', 'Punctual'] },
    { name: 'Mariam Sayed', email: 'mariam@example.com', phone: '+201000000021', nationalId: '30002022200022', rating: 4.5, about: 'Barista trainee, friendly and a quick learner.', skills: ['Teamwork', 'Cash handling'] },
    { name: 'Omar Tarek', email: 'omar@example.com', phone: '+201000000022', nationalId: '30003033200033', rating: 0, about: '', skills: [] },
  ];
  const seekers = [];
  for (const s of seekerDefs) {
    const u = await User.create({
      fullName: s.name, email: s.email, password: 'password123',
      phone: s.phone, role: 'seeker', accountStatus: 'active',
    });
    seekers.push(await JobSeeker.create({
      user: u._id, nationalId: s.nationalId, rating: s.rating, about: s.about, skills: s.skills,
    }));
  }

  // --- Jobs (most open, one pending so you can test moderator approval) ---
  const jobDefs = [
    { v: 0, title: 'Event Hostess for Tech Conference', salary: 800, location: 'New Cairo', status: 'open', description: 'Welcome attendees and direct guests during a two-day technology conference.', requirements: ['Age 18+', 'Fluent English', 'Friendly attitude'] },
    { v: 0, title: 'Wedding Setup Crew', salary: 500, location: 'Sheikh Zayed', status: 'open', description: 'Set up tables, chairs, and decor before a wedding, then break down after.', requirements: ['Able to lift 15kg', 'Punctual'] },
    { v: 1, title: 'Weekend Cashier', salary: 700, location: 'Dokki', status: 'open', description: 'Operate the POS, handle cash and card payments, and assist customers.', requirements: ['Good with numbers', 'Polite and patient'] },
    { v: 1, title: 'Brand Activation Promoter', salary: 600, location: 'Mall of Egypt', status: 'pending', description: 'Distribute product samples and explain the brand to shoppers at a mall booth.', requirements: ['Outgoing personality', 'Clear Arabic communication'] },
    { v: 2, title: 'Barista Trainee', salary: 650, location: 'Smouha', status: 'open', description: 'Learn to prepare espresso drinks, serve customers, and keep the bar clean.', requirements: ['Friendly', 'Willing to learn'] },
  ];
  const jobs = [];
  for (const j of jobDefs) {
    jobs.push(await Job.create({
      vacancy: vacancies[j.v]._id, title: j.title, salary: j.salary, location: j.location,
      status: j.status, description: j.description, requirements: j.requirements,
    }));
  }

  // --- Applications across the funnel ---
  await Application.create([
    { job: jobs[0]._id, jobSeeker: seekers[0]._id, status: 'hired' },
    { job: jobs[2]._id, jobSeeker: seekers[0]._id, status: 'completed' },
    { job: jobs[0]._id, jobSeeker: seekers[1]._id, status: 'shortlisted' },
    { job: jobs[4]._id, jobSeeker: seekers[1]._id, status: 'applied' },
    { job: jobs[2]._id, jobSeeker: seekers[2]._id, status: 'applied' },
  ]);

  // --- Saved jobs for the first seeker ---
  await SavedJob.create([
    { jobSeeker: seekers[0]._id, job: jobs[1]._id },
    { jobSeeker: seekers[0]._id, job: jobs[4]._id },
  ]);

  // --- Payment cards (one seeker payout card, one company card) ---
  await Card.create([
    { jobSeeker: seekers[0]._id, cardNumber: '4242424242424242', expiryDate: '08/27', cardType: 'visa' },
    { vacancy: vacancies[0]._id, cardNumber: '5500005555555559', expiryDate: '05/28', cardType: 'mastercard' },
  ]);

  // --- A review for a company + a welcome notification ---
  const youssef = await User.findOne({ email: 'youssef@example.com' });
  await Review.create({ job: jobs[2]._id, fromUser: youssef._id, toVacancy: vacancies[1]._id, rating: 5, comment: 'Great team, paid on time.' });
  await Notification.create({ user: youssef._id, type: 'job', title: 'Welcome to Shagalny', message: 'Your account is ready. Start applying to shifts!', read: false });

  console.log('\nSeed complete.');
  console.log('Login accounts (all non-admin passwords are "password123"):');
  console.log('  Admin     : admin@shagalny.eg / admin1234');
  console.log('  Moderator : mod@shagalny.eg / mod12345');
  console.log('  Company   : karim@pyramidevents.eg / password123  (also nadia@, sarah@)');
  console.log('  Seeker    : youssef@example.com / password123  (also mariam@, omar@)');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});

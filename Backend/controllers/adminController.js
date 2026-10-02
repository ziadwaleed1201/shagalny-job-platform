const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Vacancy = require('../models/Vacancy');
const Job = require('../models/Job');
const Application = require('../models/Application');
const JobSeeker = require('../models/JobSeeker');

// GET /api/admin/pending-vacancies
const pendingVacancies = asyncHandler(async (req, res) => {
  res.json(await Vacancy.find({ vacancyStatus: 'pending' }).populate('user', 'fullName email'));
});

// PUT /api/admin/verify-vacancy/:id
const verifyVacancy = asyncHandler(async (req, res) => {
  const vacancy = await Vacancy.findById(req.params.id);
  if (!vacancy) {
    res.status(404);
    throw new Error('Vacancy not found');
  }
  vacancy.vacancyStatus = 'verified';
  await vacancy.save();
  await User.findByIdAndUpdate(vacancy.user, { accountStatus: 'active' });
  res.json(vacancy);
});

// GET /api/admin/pending-jobs
const pendingJobs = asyncHandler(async (req, res) => {
  res.json(await Job.find({ status: 'pending' }).populate('vacancy', 'vacancyName'));
});

// GET /api/admin/users  -> every user account
const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json(users);
});

// GET /api/admin/stats  -> platform overview numbers
const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalEmployers, totalJobs, successfulHires, cities] = await Promise.all([
    User.countDocuments(),
    Vacancy.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments({ status: { $in: ['hired', 'completed'] } }),
    Job.distinct('location'),
  ]);
  res.json({
    totalUsers,
    totalEmployers,
    totalJobs,
    successfulHires,
    citiesCovered: (cities || []).filter(Boolean).length,
    activeReports: 0,
  });
});

// GET /api/admin/pending-users  -> job seekers awaiting verification
const pendingUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'seeker', accountStatus: 'pending' })
    .select('fullName email phone accountStatus createdAt')
    .sort('-createdAt');
  res.json(users);
});

// PUT /api/admin/verify-user/:id  -> approve a job seeker (mark account active)
const verifyUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.accountStatus = 'active';
  await user.save(); // password is untouched, so the hashing hook won't re-run
  res.json({ _id: user._id, accountStatus: user.accountStatus });
});

// DELETE /api/admin/reject-user/:id  -> reject (remove) a pending seeker
const rejectUser = asyncHandler(async (req, res) => {
  await JobSeeker.deleteOne({ user: req.params.id });
  await User.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
});

module.exports = { pendingVacancies, verifyVacancy, pendingJobs, listUsers, getStats, pendingUsers, verifyUser, rejectUser };

const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const Vacancy = require('../models/Vacancy');

// GET /api/jobs  (public, only open jobs unless admin/moderator)
const listJobs = asyncHandler(async (req, res) => {
  const filter = {};
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'moderator')) {
    filter.status = 'open';
  }
  if (req.query.status && req.user && ['admin', 'moderator'].includes(req.user.role)) {
    filter.status = req.query.status;
  }
  const jobs = await Job.find(filter).populate('vacancy', 'vacancyName vacancyStatus rating');
  res.json(jobs);
});

// GET /api/jobs/:id
const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('vacancy', 'vacancyName vacancyStatus rating');
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  res.json(job);
});

// POST /api/jobs  (vacancy role). New jobs start as pending for moderation.
const createJob = asyncHandler(async (req, res) => {
  const vacancy = await Vacancy.findOne({ user: req.user._id });
  if (!vacancy) {
    res.status(403);
    throw new Error('Only company (vacancy) accounts can post jobs');
  }
  const { title, description, requirements, salary, location, latitude, longitude } = req.body;
  const job = await Job.create({
    vacancy: vacancy._id,
    title,
    description,
    requirements,
    salary,
    location,
    latitude,
    longitude,
    status: 'pending',
  });
  res.status(201).json(job);
});

// PUT /api/jobs/:id/status  (moderator or admin) -> approve / close
const updateJobStatus = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  const { status } = req.body;
  if (!['open', 'pending', 'closed'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }
  job.status = status;
  await job.save();
  res.json(job);
});

// GET /api/jobs/mine  (vacancy) -> this company's own jobs
const myJobs = asyncHandler(async (req, res) => {
  const vacancy = await Vacancy.findOne({ user: req.user._id });
  if (!vacancy) return res.json([]);
  const jobs = await Job.find({ vacancy: vacancy._id }).sort('-createdAt');
  res.json(jobs);
});

module.exports = { listJobs, getJob, createJob, updateJobStatus, myJobs };


const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');
const Job = require('../models/Job');
const JobSeeker = require('../models/JobSeeker');
const Vacancy = require('../models/Vacancy');
const { notify } = require('./notificationController');

// POST /api/applications  (seeker) -> apply to a job
const applyToJob = asyncHandler(async (req, res) => {
  const seeker = await JobSeeker.findOne({ user: req.user._id });
  if (!seeker) {
    res.status(403);
    throw new Error('Only job seekers can apply');
  }
  const job = await Job.findById(req.body.job);
  if (!job || job.status !== 'open') {
    res.status(400);
    throw new Error('Job not available');
  }
  const exists = await Application.findOne({ job: job._id, jobSeeker: seeker._id });
  if (exists) {
    res.status(400);
    throw new Error('Already applied to this job');
  }
  const application = await Application.create({ job: job._id, jobSeeker: seeker._id });
  res.status(201).json(application);
});

// GET /api/applications/mine  (seeker)
const myApplications = asyncHandler(async (req, res) => {
  const seeker = await JobSeeker.findOne({ user: req.user._id });
  if (!seeker) return res.json([]);
  const apps = await Application.find({ jobSeeker: seeker._id }).populate('job', 'title status vacancy');
  res.json(apps);
});

// GET /api/applications/vacancy  (vacancy) -> applicants to my jobs
const vacancyApplications = asyncHandler(async (req, res) => {
  const vacancy = await Vacancy.findOne({ user: req.user._id });
  if (!vacancy) return res.json([]);
  const jobs = await Job.find({ vacancy: vacancy._id }).select('_id');
  const apps = await Application.find({ job: { $in: jobs.map((j) => j._id) } })
    .populate('job', 'title')
    .populate({ path: 'jobSeeker', populate: { path: 'user', select: 'fullName email' } });
  res.json(apps);
});

// PUT /api/applications/:id  (vacancy) -> shortlist / hire / reject / complete
const updateApplication = asyncHandler(async (req, res) => {
  const app = await Application.findById(req.params.id).populate('job');
  if (!app) {
    res.status(404);
    throw new Error('Application not found');
  }
  const { status } = req.body;
  if (!['applied', 'shortlisted', 'hired', 'rejected', 'completed'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }
  app.status = status;
  await app.save();

  // When a job is completed, prompt both sides to rate each other.
  if (status === 'completed') {
    try {
      const seeker = await JobSeeker.findById(app.jobSeeker).populate('user', '_id');
      const vacancy = await Vacancy.findById(app.job.vacancy).populate('user', '_id');
      const title = app.job?.title || 'the job';
      await notify(seeker?.user?._id, 'Job completed', `Please rate the company for "${title}".`, 'rate');
      await notify(vacancy?.user?._id, 'Job completed', `Please rate the worker for "${title}".`, 'rate');
    } catch (e) { /* ignore notification errors */ }
  }

  res.json(app);
});

module.exports = { applyToJob, myApplications, vacancyApplications, updateApplication };

const asyncHandler = require('express-async-handler');
const SavedJob = require('../models/SavedJob');
const JobSeeker = require('../models/JobSeeker');

// Resolve the JobSeeker profile for the logged-in user.
async function seekerFor(userId) {
  return JobSeeker.findOne({ user: userId });
}

// GET /api/saved-jobs  -> the seeker's saved jobs (full job objects)
const listSaved = asyncHandler(async (req, res) => {
  const js = await seekerFor(req.user._id);
  if (!js) return res.json([]);
  const saved = await SavedJob.find({ jobSeeker: js._id })
    .sort('-createdAt')
    .populate({
      path: 'job',
      populate: { path: 'vacancy', select: 'vacancyName vacancyStatus rating', strictPopulate: false },
    });
  res.json(saved.map((s) => s.job).filter(Boolean));
});

// POST /api/saved-jobs/:jobId/toggle  -> save if not saved, unsave if already saved
const toggleSaved = asyncHandler(async (req, res) => {
  const js = await seekerFor(req.user._id);
  if (!js) {
    res.status(400);
    throw new Error('Job seeker profile not found');
  }
  const { jobId } = req.params;
  const existing = await SavedJob.findOne({ jobSeeker: js._id, job: jobId });

  let saved;
  if (existing) {
    await existing.deleteOne();
    saved = false;
  } else {
    await SavedJob.create({ jobSeeker: js._id, job: jobId });
    saved = true;
  }

  const all = await SavedJob.find({ jobSeeker: js._id }).select('job');
  res.json({ saved, savedJobs: all.map((s) => String(s.job)) });
});

module.exports = { listSaved, toggleSaved };

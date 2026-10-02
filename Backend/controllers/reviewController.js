const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Application = require('../models/Application');
const JobSeeker = require('../models/JobSeeker');
const Vacancy = require('../models/Vacancy');
const { notify } = require('./notificationController');

async function recomputeSeekerRating(seekerId) {
  const reviews = await Review.find({ toSeeker: seekerId });
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  await JobSeeker.findByIdAndUpdate(seekerId, { rating: Math.round(avg * 10) / 10 });
}

async function recomputeVacancyRating(vacancyId) {
  const reviews = await Review.find({ toVacancy: vacancyId });
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  await Vacancy.findByIdAndUpdate(vacancyId, { rating: Math.round(avg * 10) / 10 });
}

// POST /api/reviews   body: { applicationId, rating, comment }
const createReview = asyncHandler(async (req, res) => {
  const { applicationId, rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    res.status(400); throw new Error('Rating must be between 1 and 5');
  }

  const app = await Application.findById(applicationId).populate('job');
  if (!app) { res.status(404); throw new Error('Application not found'); }
  if (app.status !== 'completed') {
    res.status(400); throw new Error('You can only rate after the job is completed');
  }

  let toSeeker = null;
  let toVacancy = null;
  let notifyUser = null;

  if (req.user.role === 'seeker') {
    const seeker = await JobSeeker.findOne({ user: req.user._id });
    if (!seeker || String(app.jobSeeker) !== String(seeker._id)) {
      res.status(403); throw new Error('This is not your job application');
    }
    toVacancy = app.job.vacancy;
    const vacancy = await Vacancy.findById(toVacancy).populate('user', '_id');
    notifyUser = vacancy?.user?._id;
  } else if (req.user.role === 'vacancy') {
    const vacancy = await Vacancy.findOne({ user: req.user._id });
    if (!vacancy || String(app.job.vacancy) !== String(vacancy._id)) {
      res.status(403); throw new Error('This worker did not work for your company');
    }
    toSeeker = app.jobSeeker;
    const seeker = await JobSeeker.findById(toSeeker).populate('user', '_id');
    notifyUser = seeker?.user?._id;
  } else {
    res.status(403); throw new Error('Only seekers and companies can leave reviews');
  }

  const already = await Review.findOne({ job: app.job._id, fromUser: req.user._id });
  if (already) { res.status(400); throw new Error('You already rated this job'); }

  const review = await Review.create({
    job: app.job._id,
    fromUser: req.user._id,
    toSeeker,
    toVacancy,
    rating: Number(rating),
    comment: comment || '',
  });

  if (toSeeker) await recomputeSeekerRating(toSeeker);
  if (toVacancy) await recomputeVacancyRating(toVacancy);

  await notify(
    notifyUser,
    'You received a new rating',
    `You got a ${rating}-star rating for "${app.job.title}".`,
    'review'
  );

  res.status(201).json(review);
});

// GET /api/reviews/mine -> reviews ABOUT the current user (seeker or company)
const myReviews = asyncHandler(async (req, res) => {
  let filter = null;
  if (req.user.role === 'seeker') {
    const seeker = await JobSeeker.findOne({ user: req.user._id });
    if (seeker) filter = { toSeeker: seeker._id };
  } else if (req.user.role === 'vacancy') {
    const vacancy = await Vacancy.findOne({ user: req.user._id });
    if (vacancy) filter = { toVacancy: vacancy._id };
  }
  if (!filter) return res.json([]);
  const reviews = await Review.find(filter).populate('fromUser', 'fullName').sort('-createdAt');
  res.json(reviews);
});

// GET /api/reviews/vacancy/:vacancyId (public) -> reviews about a company
const vacancyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ toVacancy: req.params.vacancyId })
    .populate('fromUser', 'fullName')
    .sort('-createdAt');
  res.json(reviews);
});

module.exports = { createReview, myReviews, vacancyReviews };
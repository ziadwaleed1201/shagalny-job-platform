const asyncHandler = require('express-async-handler');
const Vacancy = require('../models/Vacancy');

// GET /api/vacancies
const listVacancies = asyncHandler(async (req, res) => {
  const vacancies = await Vacancy.find().populate('user', 'fullName email');
  res.json(vacancies);
});

// GET /api/vacancies/:id
const getVacancy = asyncHandler(async (req, res) => {
  const vacancy = await Vacancy.findById(req.params.id).populate('user', 'fullName email');
  if (!vacancy) {
    res.status(404);
    throw new Error('Vacancy not found');
  }
  res.json(vacancy);
});

// PUT /api/vacancies/:id  (owner or admin)
const updateVacancy = asyncHandler(async (req, res) => {
  const vacancy = await Vacancy.findById(req.params.id);
  if (!vacancy) {
    res.status(404);
    throw new Error('Vacancy not found');
  }
  const isOwner = vacancy.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not allowed to edit this vacancy');
  }
  const { vacancyName, vacancyLicense, vacancyStatus } = req.body;
  if (vacancyName !== undefined) vacancy.vacancyName = vacancyName;
  if (vacancyLicense !== undefined) vacancy.vacancyLicense = vacancyLicense;
  if (vacancyStatus !== undefined && req.user.role === 'admin') vacancy.vacancyStatus = vacancyStatus;
  await vacancy.save();
  res.json(vacancy);
});

// GET /api/vacancies/me  (vacancy) -> the current company's profile
const myVacancy = asyncHandler(async (req, res) => {
  const vacancy = await Vacancy.findOne({ user: req.user._id }).populate('user', 'fullName email');
  if (!vacancy) {
    res.status(404);
    throw new Error('No company profile for this account');
  }
  res.json(vacancy);
});

module.exports = { listVacancies, getVacancy, updateVacancy, myVacancy };


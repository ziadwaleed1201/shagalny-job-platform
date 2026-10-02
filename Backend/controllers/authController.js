const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const JobSeeker = require('../models/JobSeeker');
const Vacancy = require('../models/Vacancy');
const Admin = require('../models/Admin');
const Moderator = require('../models/Moderator');
const generateToken = require('../utils/generateToken');

// POST /api/auth/register
// Creates a User plus the matching role profile (JobSeeker or Vacancy).
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, role } = req.body;
  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error('fullName, email and password are required');
  }
  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error('Email already registered');
  }
  const user = await User.create({
    fullName,
    email,
    password,
    phone,
    role: role || 'seeker',
    accountStatus: 'pending',
  });
  if (user.role === 'seeker') {
    const { nationalId, credentials } = req.body;
    if (!nationalId) {
      await user.deleteOne();
      res.status(400);
      throw new Error('nationalId is required for job seekers');
    }
    await JobSeeker.create({ nationalId, user: user._id, credentials: credentials || '' });
  } else if (user.role === 'vacancy') {
    const { vacancyName, vacancyLicense } = req.body;
    if (!vacancyName || !vacancyLicense) {
      await user.deleteOne();
      res.status(400);
      throw new Error('vacancyName and vacancyLicense are required for company accounts');
    }
    await Vacancy.create({ user: user._id, vacancyName, vacancyLicense });
  } else if (user.role === 'admin') {
    await Admin.create({ user: user._id });
  } else if (user.role === 'moderator') {
    await Moderator.create({ user: user._id });
  }
  res.status(201).json({
    token: generateToken(user._id),
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      accountStatus: user.accountStatus,
    },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Suspended accounts are blocked from signing in.
  if (user.accountStatus === 'suspended') {
    res.status(403);
    throw new Error('This account has been suspended. Please contact support.');
  }

  res.json({
    token: generateToken(user._id),
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      accountStatus: user.accountStatus,
    },
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// GET /api/auth/profile  (seeker) -> the seeker's editable profile
const getProfile = asyncHandler(async (req, res) => {
  if (req.user.role !== 'seeker') {
    res.status(403);
    throw new Error('Only job seekers have a profile');
  }
  const seeker = await JobSeeker.findOne({ user: req.user._id });
  if (!seeker) return res.json(null);
  res.json({
    _id: seeker._id,
    fullName: req.user.fullName,
    email: req.user.email,
    phone: req.user.phone,
    photo: seeker.photo || '',
    cv: seeker.cv || '',
    cvName: seeker.cvName || '',
    about: seeker.about || '',
    skills: seeker.skills || [],
    rating: seeker.rating || 0,
  });
});

// PUT /api/auth/profile  (seeker) -> update photo / cv / about / skills
const updateProfile = asyncHandler(async (req, res) => {
  if (req.user.role !== 'seeker') {
    res.status(403);
    throw new Error('Only job seekers have a profile');
  }
  const seeker = await JobSeeker.findOne({ user: req.user._id });
  if (!seeker) {
    res.status(404);
    throw new Error('Profile not found');
  }
  const { photo, cv, cvName, about, skills } = req.body;
  if (photo !== undefined) seeker.photo = photo;
  if (cv !== undefined) seeker.cv = cv;
  if (cvName !== undefined) seeker.cvName = cvName;
  if (about !== undefined) seeker.about = about;
  if (skills !== undefined) {
    seeker.skills = Array.isArray(skills)
      ? skills
      : String(skills).split(',').map((s) => s.trim()).filter(Boolean);
  }
  await seeker.save();
  res.json({ ok: true });
});

module.exports = { register, login, getMe, getProfile, updateProfile };

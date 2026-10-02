const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const JobSeeker = require('../models/JobSeeker');
const Vacancy = require('../models/Vacancy');

// GET /api/admin/user-profile/:id  (admin)
// Returns the full profile for any account: base User info plus the linked
// JobSeeker (for seekers) or Vacancy (for companies).
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const profile = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    accountStatus: user.accountStatus,
    createdAt: user.createdAt,
    seeker: null,
    company: null,
  };

  if (user.role === 'seeker') {
    const seeker = await JobSeeker.findOne({ user: user._id });
    if (seeker) {
      profile.seeker = {
        nationalId: seeker.nationalId || '',
        about: seeker.about || '',
        skills: seeker.skills || [],
        photo: seeker.photo || '',
        cv: seeker.cv || '',
        cvName: seeker.cvName || '',
        rating: seeker.rating || 0,
        credentials: seeker.credentials || '',
      };
    }
  } else if (user.role === 'vacancy') {
    const company = await Vacancy.findOne({ user: user._id });
    if (company) {
      profile.company = {
        vacancyName: company.vacancyName || '',
        vacancyLicense: company.vacancyLicense || '',
        vacancyStatus: company.vacancyStatus || 'pending',
        rating: company.rating || 0,
      };
    }
  }

  res.json(profile);
});

// PUT /api/admin/user-status/:id  (admin)
// Suspends or re-activates a seeker / company account.
// Body: { status: 'active' | 'suspended' }
const setUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) {
    res.status(400);
    throw new Error('status must be "active" or "suspended"');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Never let staff accounts be suspended.
  if (user.role === 'admin' || user.role === 'moderator') {
    res.status(403);
    throw new Error('Admin and moderator accounts cannot be suspended');
  }

  user.accountStatus = status;
  await user.save();

  // Keep the company's own status in sync so its jobs hide while suspended.
  if (user.role === 'vacancy') {
    const company = await Vacancy.findOne({ user: user._id });
    if (company) {
      if (status === 'suspended') {
        company.vacancyStatus = 'suspended';
      } else if (company.vacancyStatus === 'suspended') {
        // Only restore companies we suspended; leave 'pending' ones untouched.
        company.vacancyStatus = 'verified';
      }
      await company.save();
    }
  }

  res.json({ _id: user._id, accountStatus: user.accountStatus });
});

module.exports = { getUserProfile, setUserStatus };

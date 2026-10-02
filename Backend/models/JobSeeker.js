const mongoose = require('mongoose');

// Maps to "Job seeker" in the ERD. National ID is the business key (PK in the ERD);
// the link to the account is the User reference (User ID FK in the ERD).
const jobSeekerSchema = new mongoose.Schema(
  {
    nationalId: { type: String, required: true, unique: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    credentials: { type: String, default: '' },
    rating: { type: Number, default: 0, min: 0, max: 5 },

    // Profile fields
    photo: { type: String, default: '' },   // image data URL
    cv: { type: String, default: '' },      // CV file data URL
    cvName: { type: String, default: '' },
    about: { type: String, default: '' },   // experience / bio
    skills: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobSeeker', jobSeekerSchema);

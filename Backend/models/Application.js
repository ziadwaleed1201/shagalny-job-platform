const mongoose = require('mongoose');

// Composite key in the ERD: (Job ID, National ID). Enforced here with a unique
// compound index on (job, jobSeeker).
const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    jobSeeker: { type: mongoose.Schema.Types.ObjectId, ref: 'JobSeeker', required: true },
    applicationDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'hired', 'rejected','completed'],
      default: 'applied',
    },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, jobSeeker: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);

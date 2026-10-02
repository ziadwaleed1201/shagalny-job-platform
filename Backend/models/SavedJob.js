const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema(
  {
    jobSeeker: { type: mongoose.Schema.Types.ObjectId, ref: 'JobSeeker', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  },
  { timestamps: true }
);

// A seeker can only save a given job once.
savedJobSchema.index({ jobSeeker: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('SavedJob', savedJobSchema);

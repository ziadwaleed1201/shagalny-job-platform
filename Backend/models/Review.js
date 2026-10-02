const mongoose = require('mongoose');

// A rating left after a completed job. Either a seeker rates a company (toVacancy)
// or a company rates a seeker (toSeeker). Exactly one target is set.
const reviewSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toSeeker: { type: mongoose.Schema.Types.ObjectId, ref: 'JobSeeker' },
    toVacancy: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

// One review per author per job (prevents double-rating the same job).
reviewSchema.index({ job: 1, fromUser: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);

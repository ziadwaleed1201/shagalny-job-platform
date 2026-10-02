const mongoose = require('mongoose');

// Renamed from "Employer". Represents the company/vacancy account that posts jobs.
const vacancySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vacancyName: { type: String, required: true, trim: true },
    vacancyLicense: { type: String, required: true, trim: true },
    vacancyStatus: {
      type: String,
      enum: ['pending', 'verified', 'suspended'],
      default: 'pending',
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vacancy', vacancySchema);

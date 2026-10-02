const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    vacancy: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    requirements: { type: [String], default: [] },
    salary: { type: Number, default: 0 },
    location: { type: String, default: '' },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    status: { type: String, enum: ['open', 'pending', 'closed'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);

const mongoose = require('mongoose');

// A saved payment card. Belongs to either a Job seeker or a Vacancy (company).
// Exactly one owner is set, depending on who added the card.
const cardSchema = new mongoose.Schema(
  {
    jobSeeker: { type: mongoose.Schema.Types.ObjectId, ref: 'JobSeeker' },
    vacancy: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy' },
    cardholderName: { type: String, trim: true },
    cardNumber: { type: String, required: true }, // store masked / tokenized in production
    expiryDate: { type: String, required: true }, // MM/YY
    cardType: { type: String, enum: ['visa', 'mastercard', 'meeza', 'other'], default: 'other' },
  },
  { timestamps: true }
);

// A card must belong to exactly one owner: a job seeker XOR a company.
cardSchema.pre('validate', function (next) {
  const hasSeeker = !!this.jobSeeker;
  const hasVacancy = !!this.vacancy;
  if (hasSeeker === hasVacancy) {
    return next(new Error('A card must belong to exactly one owner (job seeker or company).'));
  }
  next();
});

module.exports = mongoose.model('Card', cardSchema);

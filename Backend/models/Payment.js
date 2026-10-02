const mongoose = require('mongoose');

// Escrow-style payment: held first, then released (Completed) or refunded (Failed).
const paymentSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    vacancy: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy', required: true },
    jobSeeker: { type: mongoose.Schema.Types.ObjectId, ref: 'JobSeeker', required: true },
    card: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
    amount: { type: Number, required: true, min: 0 },
    paymentStatus: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentStatus', required: true },
    paymentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);

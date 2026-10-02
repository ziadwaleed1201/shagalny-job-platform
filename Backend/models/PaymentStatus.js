const mongoose = require('mongoose');

// Lookup table. The ERD lists Completed / Failed / Held as the possible states.
const paymentStatusSchema = new mongoose.Schema(
  {
    name: { type: String, enum: ['Completed', 'Failed', 'Held'], required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentStatus', paymentStatusSchema);

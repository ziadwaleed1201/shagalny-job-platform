const mongoose = require('mongoose');

// One Payment produces several Transaction records, one per escrow step:
//   hold     -> money put into escrow when the company initiates payment
//   release  -> escrow closed once the job is confirmed complete
//   transfer -> funds moved to the job seeker's card
//   refund   -> escrow returned to the company (job not completed)
const transactionSchema = new mongoose.Schema(
  {
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
    type: {
      type: String,
      enum: ['hold', 'release', 'transfer', 'refund'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    reference: { type: String }, // bank / gateway reference for this step
    transactionStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);

const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const PaymentStatus = require('../models/PaymentStatus');
const Card = require('../models/Card');
const Job = require('../models/Job');
const Vacancy = require('../models/Vacancy');
const JobSeeker = require('../models/JobSeeker');

async function statusId(name) {
  let s = await PaymentStatus.findOne({ name });
  if (!s) s = await PaymentStatus.create({ name });
  return s._id;
}

function ref(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

// POST /api/payments
// Company (vacancy) initiates a payment for a hired job seeker.
// The seeker's card is the payout destination. Money is HELD in escrow and a
// "hold" transaction is recorded.
const initiatePayment = asyncHandler(async (req, res) => {
  const vacancy = await Vacancy.findOne({ user: req.user._id });
  if (!vacancy) {
    res.status(403);
    throw new Error('Only company (vacancy) accounts can initiate payments');
  }

  const { jobId, jobSeekerId, amount } = req.body;
  if (!jobId || !jobSeekerId || !amount || amount <= 0) {
    res.status(400);
    throw new Error('jobId, jobSeekerId and a positive amount are required');
  }

  const job = await Job.findById(jobId);
  const seeker = await JobSeeker.findById(jobSeekerId);
  if (!job || !seeker) {
    res.status(400);
    throw new Error('Valid jobId and jobSeekerId are required');
  }

  // The card on file for the job seeker is the destination for the payout.
  const card = await Card.findOne({ jobSeeker: seeker._id });
  if (!card) {
    res.status(400);
    throw new Error('Job seeker has no payout card on file');
  }

  const payment = await Payment.create({
    job: job._id,
    vacancy: vacancy._id,
    jobSeeker: seeker._id,
    card: card._id,
    amount,
    paymentStatus: await statusId('Held'),
  });

  // Escrow hold confirmed -> first transaction in the process.
  const hold = await Transaction.create({
    payment: payment._id,
    type: 'hold',
    amount,
    reference: ref('HOLD'),
    transactionStatus: 'completed',
  });

  res.status(201).json({
    message: 'Payment held in escrow',
    payment,
    transactions: [hold],
  });
});

// PUT /api/payments/:id/release
// Job confirmed complete: escrow is released and funds are transferred to the
// seeker's card. Records a "release" then a "transfer" transaction.
const releasePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('paymentStatus').populate('card');
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }
  if (payment.paymentStatus.name !== 'Held') {
    res.status(400);
    throw new Error('Only payments held in escrow can be released');
  }

  payment.paymentStatus = await statusId('Completed');
  await payment.save();

  const release = await Transaction.create({
    payment: payment._id,
    type: 'release',
    amount: payment.amount,
    reference: ref('REL'),
    transactionStatus: 'completed',
  });
  const transfer = await Transaction.create({
    payment: payment._id,
    type: 'transfer',
    amount: payment.amount,
    reference: ref('TRF'),
    transactionStatus: 'completed',
  });

  res.json({
    message: `Escrow released and ${payment.amount} transferred to card ${payment.card ? payment.card.cardNumber : ''}`,
    payment,
    transactions: [release, transfer],
  });
});

// PUT /api/payments/:id/refund
// Job not completed: escrow returns to the company. Records a "refund" transaction.
const refundPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('paymentStatus');
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }
  if (payment.paymentStatus.name !== 'Held') {
    res.status(400);
    throw new Error('Only payments held in escrow can be refunded');
  }

  payment.paymentStatus = await statusId('Failed');
  await payment.save();

  const refund = await Transaction.create({
    payment: payment._id,
    type: 'refund',
    amount: payment.amount,
    reference: ref('REF'),
    transactionStatus: 'completed',
  });

  res.json({ message: 'Payment refunded to company', payment, transactions: [refund] });
});

// GET /api/payments/:id  -> full payment with its transactions and card
const getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('paymentStatus', 'name')
    .populate('card')
    .populate('vacancy', 'vacancyName')
    .populate('job', 'title');
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }
  const transactions = await Transaction.find({ payment: payment._id }).sort('createdAt');
  res.json({ payment, transactions });
});

// GET /api/payments  (admin) -> all payments
const listPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate('paymentStatus', 'name')
    .populate('vacancy', 'vacancyName')
    .populate('job', 'title');
  res.json(payments);
});

module.exports = { initiatePayment, releasePayment, refundPayment, getPayment, listPayments };

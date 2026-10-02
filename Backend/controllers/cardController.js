const asyncHandler = require('express-async-handler');
const Card = require('../models/Card');
const JobSeeker = require('../models/JobSeeker');
const Vacancy = require('../models/Vacancy');

// Resolve the owner profile (job seeker or company) for the logged-in user.
async function resolveOwner(req) {
  if (req.user.role === 'seeker') {
    const seeker = await JobSeeker.findOne({ user: req.user._id });
    return seeker ? { field: 'jobSeeker', id: seeker._id } : null;
  }
  if (req.user.role === 'vacancy') {
    const vacancy = await Vacancy.findOne({ user: req.user._id });
    return vacancy ? { field: 'vacancy', id: vacancy._id } : null;
  }
  return null;
}

// POST /api/cards  (seeker or company) -> add a card
const addCard = asyncHandler(async (req, res) => {
  const owner = await resolveOwner(req);
  if (!owner) {
    res.status(403);
    throw new Error('Only job seekers or companies can add cards');
  }

  const { cardNumber, expiryDate, cardType, cardholderName } = req.body;
  if (!cardNumber || !expiryDate) {
    res.status(400);
    throw new Error('cardNumber and expiryDate are required');
  }

  // Never store the full PAN. Keep only a masked form.
  const digits = String(cardNumber).replace(/\D/g, '');
  const masked = '**** **** **** ' + digits.slice(-4);

  const card = await Card.create({
    [owner.field]: owner.id,
    cardholderName,
    cardNumber: masked,
    expiryDate,
    cardType,
  });

  res.status(201).json(card);
});

// GET /api/cards  (seeker or company) -> my cards
const myCards = asyncHandler(async (req, res) => {
  const owner = await resolveOwner(req);
  if (!owner) return res.json([]);
  res.json(await Card.find({ [owner.field]: owner.id }).sort('-createdAt'));
});

// DELETE /api/cards/:id  (owner) -> remove one of my cards
const deleteCard = asyncHandler(async (req, res) => {
  const owner = await resolveOwner(req);
  if (!owner) {
    res.status(403);
    throw new Error('Not authorized');
  }
  const card = await Card.findOne({ _id: req.params.id, [owner.field]: owner.id });
  if (!card) {
    res.status(404);
    throw new Error('Card not found');
  }
  await card.deleteOne();
  res.json({ message: 'Card removed' });
});

module.exports = { addCard, myCards, deleteCard };

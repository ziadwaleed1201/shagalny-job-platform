const express = require('express');
const router = express.Router();
const { addCard, myCards, deleteCard } = require('../controllers/cardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('seeker', 'vacancy'), addCard);
router.get('/', protect, authorize('seeker', 'vacancy'), myCards);
router.delete('/:id', protect, authorize('seeker', 'vacancy'), deleteCard);

module.exports = router;

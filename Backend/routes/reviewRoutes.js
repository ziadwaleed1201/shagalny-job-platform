const express = require('express');
const router = express.Router();
const { createReview, myReviews, vacancyReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('seeker', 'vacancy'), createReview);
router.get('/mine', protect, myReviews);
router.get('/vacancy/:vacancyId', vacancyReviews);

module.exports = router;

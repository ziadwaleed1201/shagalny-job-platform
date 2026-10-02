const express = require('express');
const router = express.Router();
const {
  initiatePayment, releasePayment, refundPayment, getPayment, listPayments,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('vacancy'), initiatePayment);
router.put('/:id/release', protect, authorize('vacancy', 'admin'), releasePayment);
router.put('/:id/refund', protect, authorize('vacancy', 'admin'), refundPayment);
router.get('/:id', protect, getPayment);
router.get('/', protect, authorize('admin'), listPayments);

module.exports = router;

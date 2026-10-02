const express = require('express');
const router = express.Router();
const {
  applyToJob, myApplications, vacancyApplications, updateApplication,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('seeker'), applyToJob);
router.get('/mine', protect, authorize('seeker'), myApplications);
router.get('/vacancy', protect, authorize('vacancy'), vacancyApplications);
router.put('/:id', protect, authorize('vacancy', 'admin'), updateApplication);

module.exports = router;

const express = require('express');
const router = express.Router();
const { listJobs, getJob, createJob, updateJobStatus, myJobs } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', listJobs);
router.get('/mine', protect, authorize('vacancy'), myJobs);
router.get('/:id', getJob);
router.post('/', protect, authorize('vacancy'), createJob);
router.put('/:id/status', protect, authorize('moderator', 'admin'), updateJobStatus);

module.exports = router;

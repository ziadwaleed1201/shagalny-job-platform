const express = require('express');
const router = express.Router();
const { listSaved, toggleSaved } = require('../controllers/savedJobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('seeker'));
router.get('/', listSaved);
router.post('/:jobId/toggle', toggleSaved);

module.exports = router;

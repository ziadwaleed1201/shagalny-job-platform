const express = require('express');
const router = express.Router();
const { listVacancies, getVacancy, updateVacancy, myVacancy } = require('../controllers/vacancyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', listVacancies);
router.get('/me', protect, myVacancy);
router.get('/:id', getVacancy);
router.put('/:id', protect, updateVacancy);

module.exports = router;

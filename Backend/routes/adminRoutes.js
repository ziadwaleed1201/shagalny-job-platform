const express = require('express');
const router = express.Router();
const {
  pendingVacancies, verifyVacancy, pendingJobs, listUsers, getStats,
  pendingUsers, verifyUser, rejectUser,
} = require('../controllers/adminController');
const { getUserProfile, setUserStatus } = require('../controllers/adminProfileController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require a logged-in user; role is checked per route below.
router.use(protect);

// Admin-only
router.get('/stats', authorize('admin'), getStats);
router.get('/users', authorize('admin'), listUsers);
router.get('/pending-users', authorize('admin'), pendingUsers);
router.put('/verify-user/:id', authorize('admin'), verifyUser);
router.delete('/reject-user/:id', authorize('admin'), rejectUser);

// Admin-only — view a full profile and suspend / reactivate an account
router.get('/user-profile/:id', authorize('admin'), getUserProfile);
router.put('/user-status/:id', authorize('admin'), setUserStatus);

// Admin or Moderator (both review companies and job posts)
router.get('/pending-vacancies', authorize('admin', 'moderator'), pendingVacancies);
router.put('/verify-vacancy/:id', authorize('admin', 'moderator'), verifyVacancy);
router.get('/pending-jobs', authorize('admin', 'moderator'), pendingJobs);

module.exports = router;

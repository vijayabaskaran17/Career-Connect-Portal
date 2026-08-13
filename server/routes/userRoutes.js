const express = require('express');
const {
  updateProfile,
  getCandidates,
  getPendingRecruiters,
  approveRecruiter,
  getAllUsers,
  toggleUserActive,
  getStats,
  completeDailyMission,
  completeSkillWorkout,
  getNotifications,
  markNotificationsRead,
  makeUserPermanent,
  setUserExpiry,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.get('/candidates', protect, authorize('recruiter', 'admin'), getCandidates);
router.get('/pending-recruiters', protect, authorize('admin'), getPendingRecruiters);
router.put('/:id/approve', protect, authorize('admin'), approveRecruiter);
router.get('/all-users', protect, authorize('admin'), getAllUsers);
router.put('/:id/toggle-active', protect, authorize('admin'), toggleUserActive);
router.get('/stats', protect, authorize('admin'), getStats);
router.post('/daily-mission/complete', protect, completeDailyMission);
router.post('/skill-workout/complete', protect, completeSkillWorkout);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);
router.put('/:id/make-permanent', protect, authorize('admin'), makeUserPermanent);
router.put('/:id/set-expiry', protect, authorize('admin'), setUserExpiry);

module.exports = router;


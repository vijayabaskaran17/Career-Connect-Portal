const express = require('express');
const {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
  getAllApplications,
  adminCreateApplication,
  deleteApplication,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('student'), applyToJob);
router.get('/mine', protect, authorize('student'), getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getApplicationsForJob);
router.get('/all', protect, authorize('admin'), getAllApplications);
router.post('/admin-create', protect, authorize('admin'), adminCreateApplication);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.delete('/:id', protect, authorize('admin'), deleteApplication);

module.exports = router;

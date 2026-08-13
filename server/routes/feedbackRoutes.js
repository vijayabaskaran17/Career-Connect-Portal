const express = require('express');
const {
  createFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  deleteFeedback,
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Optional auth middleware so logged in users auto-populate user ref
const optionalProtect = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : null;
  if (token) {
    return protect(req, res, next);
  }
  next();
};

router.post('/', optionalProtect, createFeedback);
router.get('/', protect, authorize('admin'), getAllFeedback);
router.put('/:id/status', protect, authorize('admin'), updateFeedbackStatus);
router.delete('/:id', protect, authorize('admin'), deleteFeedback);

module.exports = router;

const Feedback = require('../models/Feedback');

// @route   POST /api/feedback
// @desc    Submit contact message or platform feedback
// @access  Public / Authenticated
const createFeedback = async (req, res, next) => {
  try {
    const { name, email, role, category, subject, message, rating } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const feedback = await Feedback.create({
      name,
      email,
      role: role || (req.user ? req.user.role : 'guest'),
      user: req.user ? req.user._id : null,
      category: category || 'General Inquiry',
      subject,
      message,
      rating: Number(rating) || 5,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback has been sent to our support team.',
      feedback,
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/feedback
// @desc    Get all feedback entries (Admin only)
// @access  Private / Admin
const getAllFeedback = async (req, res, next) => {
  try {
    const { category, status, role } = req.query;
    let filter = {};

    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;
    if (role && role !== 'All') filter.role = role;

    const feedbacks = await Feedback.find(filter)
      .populate('user', 'name email role profilePhoto')
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/feedback/:id/status
// @desc    Update feedback status or admin note (Admin only)
// @access  Private / Admin
const updateFeedbackStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback entry not found' });
    }

    if (status) feedback.status = status;
    if (adminNotes !== undefined) feedback.adminNotes = adminNotes;

    await feedback.save();

    res.json({ success: true, feedback });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback entry (Admin only)
// @access  Private / Admin
const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback entry not found' });
    }
    res.json({ success: true, message: 'Feedback entry deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  deleteFeedback,
};

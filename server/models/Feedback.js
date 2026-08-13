const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, enum: ['student', 'recruiter', 'admin', 'guest'], default: 'guest' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    category: {
      type: String,
      enum: ['General Inquiry', 'Feedback', 'Bug Report', 'Recruiter Support', 'Feature Request'],
      default: 'General Inquiry',
    },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    status: { type: String, enum: ['New', 'In Progress', 'Resolved'], default: 'New' },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);

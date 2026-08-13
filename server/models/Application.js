const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'interview', 'rejected', 'selected'],
      default: 'pending',
    },
    resumeSnapshot: { type: String, default: '' },
    coverNote: { type: String, default: '' },
    interviewDetails: {
      date: { type: Date },
      type: { type: String, default: 'Technical Interview' },
      note: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);

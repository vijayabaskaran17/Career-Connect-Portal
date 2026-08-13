const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    company: { type: String, required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillsRequired: [{ type: String }],
    location: { type: String, default: 'Remote' },
    workPreference: {
      type: String,
      enum: ['On-site', 'Remote', 'Hybrid'],
      default: 'Remote',
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance', 'Apprenticeship'],
      default: 'Full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['Entry', 'Mid', 'Senior', 'Executive', 'All Levels'],
      default: 'Entry',
    },
    industry: { type: String, default: 'Technology' },
    targetCareerStages: [{ type: String }],
    salaryRange: { type: String, default: 'Not disclosed' },
    deadline: { type: Date },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', company: 'text', skillsRequired: 'text' });

module.exports = mongoose.model('Job', jobSchema);


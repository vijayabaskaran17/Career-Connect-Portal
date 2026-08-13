const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['student', 'recruiter', 'admin'], default: 'student' },

    // Basic & Contact Information
    phone: { type: String, default: '' },
    dob: { type: String, default: '' },
    age: { type: Number, default: 0 },
    gender: { type: String, default: '' },
    currentLocation: { type: String, default: 'Remote' },
    preferredLocation: { type: String, default: 'Remote' },
    profilePhoto: { type: String, default: '' },
    isActive: { type: Boolean, default: true },

    // Multi-Age Career Stage & Information
    careerStage: {
      type: String,
      enum: [
        'School Student',
        'College Student',
        'Recent Graduate',
        'Fresher',
        'Entry Level',
        'Working Professional',
        'Experienced Professional',
        'Career Switcher',
        'Returning to Work',
        'Freelancer',
        'Part-Time Job Seeker',
        'Retired / Looking for Opportunities',
        'Other',
      ],
      default: 'College Student',
    },
    currentJobTitle: { type: String, default: '' },
    targetJobTitle: { type: String, default: '' },
    totalExperienceYears: { type: Number, default: 0 },
    industry: { type: String, default: '' },
    preferredIndustry: { type: String, default: '' },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance', 'Apprenticeship'],
      default: 'Full-time',
    },
    expectedSalary: { type: String, default: 'Not disclosed' },
    noticePeriod: { type: String, default: 'Immediate' },
    workPreference: {
      type: String,
      enum: ['On-site', 'Remote', 'Hybrid'],
      default: 'Remote',
    },

    // Detailed Education Structure
    highestQualification: { type: String, default: "Bachelor's Degree" },
    degree: { type: String, default: '' },
    specialization: { type: String, default: '' },
    institution: { type: String, default: '' },
    graduationYear: { type: String, default: '' },
    cgpa: { type: String, default: '' },
    education: { type: String, default: '' }, // Legacy string fallback

    // Skills & Preferences
    skills: [{ type: String }],
    targetRoles: [{ type: String }],
    preferredIndustries: [{ type: String }],
    preferredLocations: [{ type: String }],
    careerGoals: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },

    // Gamification & Skill Score Tracking
    skillScore: { type: Number, default: 250 },
    workoutStats: {
      aptitudeCompleted: { type: Number, default: 0 },
      codingCompleted: { type: Number, default: 0 },
      interviewCompleted: { type: Number, default: 0 },
      totalWorkouts: { type: Number, default: 0 },
    },
    xp: { type: Number, default: 150 },
    streak: {
      count: { type: Number, default: 1 },
      lastActive: { type: Date, default: Date.now },
    },
    dailyMissions: [
      {
        id: { type: String },
        title: { type: String },
        xp: { type: Number, default: 20 },
        completed: { type: Boolean, default: false },
        category: { type: String, default: 'General' },
      },
    ],

    // Notifications
    notifications: [
      {
        title: { type: String, required: true },
        message: { type: String, required: true },
        date: { type: Date, default: Date.now },
        read: { type: Boolean, default: false },
        link: { type: String, default: '' },
        type: { type: String, default: 'info' },
      },
    ],

    // Recruiter-specific
    company: { type: String, default: '' },
    companyIndustry: { type: String, default: '' },
    companyLocation: { type: String, default: '' },
    companySize: { type: String, default: '10-50' },
    website: { type: String, default: '' },
    recruiterPosition: { type: String, default: 'Hiring Manager' },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role !== 'recruiter';
      },
    },

    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);


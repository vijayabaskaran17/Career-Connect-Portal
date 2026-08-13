const User = require('../models/User');

// Helper to compute profile completion %
const calculateProfileCompletion = (user) => {
  let fields = [
    user.name, user.email, user.phone, user.currentLocation, user.careerStage,
    user.degree || user.highestQualification, user.skills?.length > 0, user.resumeUrl || user.careerGoals,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.min(100, Math.round((filled / fields.length) * 100));
};

// @route PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'phone', 'dob', 'age', 'gender', 'currentLocation', 'preferredLocation', 'profilePhoto',
      'careerStage', 'currentJobTitle', 'targetJobTitle', 'totalExperienceYears', 'industry',
      'preferredIndustry', 'employmentType', 'expectedSalary', 'noticePeriod', 'workPreference',
      'highestQualification', 'degree', 'specialization', 'institution', 'graduationYear', 'cgpa',
      'skills', 'targetRoles', 'preferredIndustries', 'preferredLocations', 'careerGoals', 'resumeUrl',
      'company', 'companyIndustry', 'companyLocation', 'companySize', 'website', 'recruiterPosition', 'education'
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/users/candidates (Recruiter Candidate Search)
const getCandidates = async (req, res, next) => {
  try {
    const { careerStage, skill, experience, location, workPreference, search } = req.query;

    let query = { role: 'student', isActive: true };

    if (careerStage && careerStage !== 'All') {
      query.careerStage = careerStage;
    }

    if (skill) {
      query.skills = { $regex: new RegExp(skill, 'i') };
    }

    if (location) {
      query.currentLocation = { $regex: new RegExp(location, 'i') };
    }

    if (workPreference && workPreference !== 'All') {
      query.workPreference = workPreference;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { currentJobTitle: searchRegex },
        { targetJobTitle: searchRegex },
        { skills: searchRegex },
        { degree: searchRegex },
        { institution: searchRegex },
      ];
    }

    let candidates = await User.find(query).select('-password').lean();

    // Min experience filter
    if (experience) {
      const minExp = parseFloat(experience);
      if (!isNaN(minExp)) {
        candidates = candidates.filter((c) => (c.totalExperienceYears || 0) >= minExp);
      }
    }

    // Attach profile completion and match calculation
    const formatted = candidates.map((c) => ({
      ...c,
      profileCompletion: calculateProfileCompletion(c),
      matchScore: Math.min(98, 65 + ((c.skills?.length || 0) * 4) + (c.resumeUrl ? 10 : 0)),
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/users/pending-recruiters (admin only)
const getPendingRecruiters = async (req, res, next) => {
  try {
    const recruiters = await User.find({ role: 'recruiter', isApproved: false }).select('-password');
    res.json(recruiters);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/users/:id/approve (admin only)
const approveRecruiter = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/users/all-users (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    const formatted = users.map((u) => ({
      ...u,
      profileCompletion: calculateProfileCompletion(u),
    }));
    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/users/:id/toggle-active (admin only)
const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ _id: user._id, isActive: user.isActive, message: `User status changed to ${user.isActive ? 'Active' : 'Inactive'}` });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/users/stats (admin dashboard analytics)
const getStats = async (req, res, next) => {
  try {
    const Job = require('../models/Job');
    const Application = require('../models/Application');

    const [
      totalUsers,
      studentCount,
      recruiterCount,
      approvedRecruiters,
      jobCount,
      applicationCount,
      interviewCount,
      selectedCount,
      usersByStageRaw,
      allJobSkills
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'recruiter' }),
      User.countDocuments({ role: 'recruiter', isApproved: true }),
      Job.countDocuments(),
      Application.countDocuments(),
      Application.countDocuments({ status: 'interview' }),
      Application.countDocuments({ status: 'selected' }),
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: '$careerStage', count: { $sum: 1 } } }
      ]),
      Job.find({}).select('skillsRequired')
    ]);

    const stageBreakdown = {};
    usersByStageRaw.forEach((item) => {
      stageBreakdown[item._id || 'College Student'] = item.count;
    });

    // Top demanded skills from posted jobs
    const skillCounts = {};
    allJobSkills.forEach((job) => {
      (job.skillsRequired || []).forEach((sk) => {
        const key = sk.trim();
        skillCounts[key] = (skillCounts[key] || 0) + 1;
      });
    });

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    res.json({
      totalUsers,
      studentCount,
      recruiterCount,
      approvedRecruiters,
      jobCount,
      applicationCount,
      interviewCount,
      selectedCount,
      stageBreakdown,
      topSkills,
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/users/daily-mission/complete
const completeDailyMission = async (req, res, next) => {
  try {
    const { missionId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.xp = (user.xp || 0) + 50;

    // Check streak
    const now = new Date();
    const lastActive = user.streak?.lastActive ? new Date(user.streak.lastActive) : null;
    if (!lastActive || (now - lastActive) > 24 * 60 * 60 * 1000) {
      user.streak = { count: (user.streak?.count || 1) + 1, lastActive: now };
    }

    user.notifications.unshift({
      title: '🎯 Daily Mission Completed!',
      message: `You completed a career mission and earned +50 XP! Keep your 🔥 ${user.streak.count} day streak alive.`,
      date: new Date(),
      read: false,
      type: 'achievement',
    });

    await user.save();
    res.json({ xp: user.xp, streak: user.streak, notifications: user.notifications });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/users/skill-workout/complete
const completeSkillWorkout = async (req, res, next) => {
  try {
    const { workoutType, scoreEarned, workoutTitle } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const pointsGained = Number(scoreEarned) || 25;
    user.skillScore = (user.skillScore || 250) + pointsGained;
    user.xp = (user.xp || 150) + 50;

    if (!user.workoutStats) {
      user.workoutStats = { aptitudeCompleted: 0, codingCompleted: 0, interviewCompleted: 0, totalWorkouts: 0 };
    }

    if (workoutType === 'aptitude') user.workoutStats.aptitudeCompleted = (user.workoutStats.aptitudeCompleted || 0) + 1;
    else if (workoutType === 'coding') user.workoutStats.codingCompleted = (user.workoutStats.codingCompleted || 0) + 1;
    else if (workoutType === 'interview') user.workoutStats.interviewCompleted = (user.workoutStats.interviewCompleted || 0) + 1;

    user.workoutStats.totalWorkouts = (user.workoutStats.totalWorkouts || 0) + 1;

    // Check streak
    const now = new Date();
    const lastActive = user.streak?.lastActive ? new Date(user.streak.lastActive) : null;
    if (!lastActive || (now - lastActive) > 24 * 60 * 60 * 1000) {
      user.streak = { count: (user.streak?.count || 1) + 1, lastActive: now };
    }

    user.notifications.unshift({
      title: '🏆 Skill Challenge Completed!',
      message: `Completed "${workoutTitle || 'Skill Workout'}"! Earned +${pointsGained} Skill Score & +50 XP! Total Skill Score: ${user.skillScore}.`,
      date: new Date(),
      read: false,
      type: 'achievement',
    });

    await user.save();
    res.json({
      skillScore: user.skillScore,
      xp: user.xp,
      workoutStats: user.workoutStats,
      streak: user.streak,
      notifications: user.notifications,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/users/notifications
const getNotifications = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json(user ? user.notifications : []);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/users/notifications/read
const markNotificationsRead = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.notifications.forEach((n) => (n.read = true));
      await user.save();
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/users/:id/make-permanent (admin or self makes temporary account permanent)
const makeUserPermanent = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isTemporary = false;
    user.expiresAt = null;
    await user.save();

    res.json({ message: 'User account converted to Permanent in DB', user });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/users/:id/set-expiry (admin or self sets temporary TTL expiration)
const setUserExpiry = async (req, res, next) => {
  try {
    const { hours } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const expiryHours = Number(hours) || 24;
    user.isTemporary = true;
    user.expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    await user.save();

    res.json({ message: `User account set to expire & auto-delete in ${expiryHours} hours`, user });
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};


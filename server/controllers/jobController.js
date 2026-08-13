const Job = require('../models/Job');
const Application = require('../models/Application');

// Helper for multi-factor weighted job matching
const calculateJobMatch = (job, user) => {
  if (!user || user.role !== 'student') return null;

  const userSkills = (user.skills || []).map((s) => s.toLowerCase());
  const requiredSkills = (job.skillsRequired || []).map((s) => s.toLowerCase());

  let matchedSkills = [];
  let missingSkills = [];

  requiredSkills.forEach((sk) => {
    if (userSkills.some((uSk) => uSk.includes(sk) || sk.includes(uSk))) {
      matchedSkills.push(sk);
    } else {
      missingSkills.push(sk);
    }
  });

  // 1. Skill Score (40%)
  const skillRatio = requiredSkills.length > 0 ? matchedSkills.length / requiredSkills.length : 0.8;
  const skillScore = skillRatio * 40;

  // 2. Experience Score (20%)
  let expScore = 15;
  const userExp = user.totalExperienceYears || 0;
  if (job.experienceLevel === 'Entry' && userExp <= 2) expScore = 20;
  else if (job.experienceLevel === 'Mid' && userExp >= 2 && userExp <= 5) expScore = 20;
  else if (job.experienceLevel === 'Senior' && userExp >= 5) expScore = 20;

  // 3. Location / Work Preference (20%)
  let prefScore = 10;
  if (job.workPreference === user.workPreference || job.location === 'Remote') prefScore = 20;
  else if (job.location?.toLowerCase().includes(user.currentLocation?.toLowerCase())) prefScore = 18;

  // 4. Stage Alignment (20%)
  let stageScore = 15;
  if (job.targetCareerStages && job.targetCareerStages.includes(user.careerStage)) {
    stageScore = 20;
  }

  const matchPercentage = Math.min(99, Math.max(45, Math.round(skillScore + expScore + prefScore + stageScore)));

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
  };
};

// @route GET /api/jobs (public/authenticated, with search/filter/pagination)
const getJobs = async (req, res, next) => {
  try {
    const { search, location, jobType, workPreference, experienceLevel, page = 1, limit = 20 } = req.query;
    const query = { status: 'open' };

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') },
        { skillsRequired: new RegExp(search, 'i') },
      ];
    }
    if (location) query.location = new RegExp(location, 'i');
    if (jobType && jobType !== 'All') query.jobType = jobType;
    if (workPreference && workPreference !== 'All') query.workPreference = workPreference;
    if (experienceLevel && experienceLevel !== 'All') query.experienceLevel = experienceLevel;

    const rawJobs = await Job.find(query)
      .populate('recruiter', 'name company')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Job.countDocuments(query);

    // Compute match score if user is logged in
    const jobs = rawJobs.map((job) => {
      const match = req.user ? calculateJobMatch(job, req.user) : null;
      return {
        ...job,
        matchDetails: match,
        matchPercentage: match ? match.matchPercentage : null,
      };
    });

    res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/jobs/:id
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name company email').lean();
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const match = req.user ? calculateJobMatch(job, req.user) : null;

    res.json({
      ...job,
      matchDetails: match,
      matchPercentage: match ? match.matchPercentage : null,
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/jobs (recruiter only)
const createJob = async (req, res, next) => {
  try {
    if (!req.user.isApproved) {
      return res.status(403).json({ message: 'Your recruiter account is pending admin approval' });
    }
    const job = await Job.create({
      ...req.body,
      recruiter: req.user._id,
      company: req.body.company || req.user.company,
    });
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/jobs/:id (recruiter who owns it)
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this job' });
    }
    Object.assign(job, req.body);
    await job.save();
    res.json(job);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/jobs/:id
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }
    await job.deleteOne();
    await Application.deleteMany({ job: job._id });
    res.json({ message: 'Job removed' });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/jobs/recruiter/mine
const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    next(err);
  }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs };


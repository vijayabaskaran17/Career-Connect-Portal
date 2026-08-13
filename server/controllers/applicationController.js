const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// @route POST /api/applications (student/job seeker)
const applyToJob = async (req, res, next) => {
  try {
    const { jobId, coverNote } = req.body;

    const job = await Job.findById(jobId);
    if (!job || job.status !== 'open') {
      return res.status(400).json({ message: 'Job not available' });
    }

    const existing = await Application.findOne({ job: jobId, student: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already applied to this job' });

    const application = await Application.create({
      job: jobId,
      student: req.user._id,
      resumeSnapshot: req.user.resumeUrl,
      coverNote,
    });

    // Send notification to applicant
    const student = await User.findById(req.user._id);
    if (student) {
      student.notifications.unshift({
        title: '📋 Application Submitted',
        message: `Your application for ${job.title} at ${job.company} has been received!`,
        date: new Date(),
        read: false,
        type: 'info',
      });
      await student.save();
    }

    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/applications/mine (candidate's own applications)
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate('job', 'title company location status salaryRange jobType workPreference')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/applications/job/:jobId (recruiter viewing applicants)
const getApplicationsForJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('student', 'name email phone careerStage skills resumeUrl highestQualification degree currentJobTitle targetJobTitle totalExperienceYears currentLocation workPreference expectedSalary')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/applications/:id/status (recruiter or admin updates status)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, interviewDetails } = req.body;
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const isRecruiter = application.job.recruiter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isRecruiter && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update status' });
    }

    application.status = status;
    if (interviewDetails) {
      application.interviewDetails = interviewDetails;
    }
    await application.save();

    // Trigger candidate notification
    const candidate = await User.findById(application.student);
    if (candidate) {
      let title = 'Application Update';
      let msg = `Your application for ${application.job.title} at ${application.job.company} status was updated to ${status}.`;

      if (status === 'shortlisted') {
        title = '🎉 Shortlisted!';
        msg = `Congratulations! You have been shortlisted for ${application.job.title} at ${application.job.company}.`;
      } else if (status === 'interview') {
        title = '📅 Interview Invitation!';
        msg = `You are invited to an interview for ${application.job.title} at ${application.job.company}!`;
      } else if (status === 'selected') {
        title = '🌟 Selected / Offer Extended!';
        msg = `Fantastic news! You have been selected for ${application.job.title} at ${application.job.company}!`;
      }

      candidate.notifications.unshift({
        title,
        message: msg,
        date: new Date(),
        read: false,
        type: status,
      });
      await candidate.save();
    }

    res.json(application);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/applications/all (Admin gets all applications)
const getAllApplications = async (req, res, next) => {
  try {
    const { status, jobId, studentId } = req.query;
    let filter = {};
    if (status && status !== 'All') filter.status = status;
    if (jobId && jobId !== 'All') filter.job = jobId;
    if (studentId && studentId !== 'All') filter.student = studentId;

    const applications = await Application.find(filter)
      .populate('job', 'title company location status salaryRange jobType workPreference')
      .populate('student', 'name email phone careerStage skills resumeUrl highestQualification degree currentJobTitle targetJobTitle')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/applications/admin-create (Admin creates application for any candidate)
const adminCreateApplication = async (req, res, next) => {
  try {
    const { jobId, studentId, coverNote, status } = req.body;

    if (!jobId || !studentId) {
      return res.status(400).json({ message: 'Job ID and Student ID are required' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Target job not found' });

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Valid Candidate / Student account required' });
    }

    const existing = await Application.findOne({ job: jobId, student: studentId });
    if (existing) {
      return res.status(400).json({ message: 'Candidate has already applied to this job' });
    }

    const application = await Application.create({
      job: jobId,
      student: studentId,
      resumeSnapshot: student.resumeUrl,
      coverNote: coverNote || `Application assigned by Placement Admin for ${job.company}`,
      status: status || 'pending',
    });

    student.notifications.unshift({
      title: '📋 Application Registered by Admin',
      message: `Admin has registered an application for you for ${job.title} at ${job.company}!`,
      date: new Date(),
      read: false,
      type: 'info',
    });
    await student.save();

    const populatedApp = await Application.findById(application._id)
      .populate('job', 'title company location status salaryRange')
      .populate('student', 'name email phone careerStage skills');

    res.status(201).json(populatedApp);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/applications/:id (Admin deletes application)
const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
  getAllApplications,
  adminCreateApplication,
  deleteApplication,
};


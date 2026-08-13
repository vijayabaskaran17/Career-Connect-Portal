const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, company, skills, isTemporary, tempDurationHours } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);

    // Calculate TTL expiry date if account is temporary
    let expiresAt = null;
    if (isTemporary) {
      const hours = Number(tempDurationHours) || 24;
      expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    }

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || 'student',
      company: role === 'recruiter' ? company : undefined,
      skills: skills || [],
      isTemporary: Boolean(isTemporary),
      expiresAt,
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      ...userObj,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid email or password' });

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      ...userObj,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ message: err.message || 'Login failed' });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch user' });
  }
};

// @route POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    const hashed = await bcrypt.hash(newPassword, 10);

    if (user) {
      user.password = hashed;
      await user.save();
      return res.json({ message: '✅ Password reset successfully! You can now log in.' });
    } else {
      // Auto-create user account if email is new so reset/login never fails
      const nameParts = cleanEmail.split('@')[0].split(/[._-]/);
      const formattedName = nameParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

      user = await User.create({
        name: formattedName || 'User',
        email: cleanEmail,
        password: hashed,
        role: 'student',
        careerStage: 'College Student',
      });
      return res.json({ message: '✅ Account registered & password set! You can now log in.' });
    }
  } catch (err) {
    console.error('Error in resetPassword:', err);
    res.status(500).json({ message: err.message || 'Failed to reset password' });
  }
};

module.exports = { register, login, getMe, resetPassword };

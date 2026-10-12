const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Todo = require('../models/Todo');

const JWT_SECRET = process.env.JWT_SECRET || 'taskflow_secret_jwt_key_2026_change_in_production';

// Helper to sign JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ── POST /api/auth/register ──────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'user';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: `${assignedRole === 'admin' ? 'Admin' : 'User'} registered successfully!`,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: `Welcome back, ${user.name}! Logged in as ${user.role.toUpperCase()}.`,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/users (Admin Only) ─────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');

    // Aggregate tasks count per user
    const userStats = await Promise.all(
      users.map(async (u) => {
        const [totalTasks, completedTasks] = await Promise.all([
          Todo.countDocuments({ user: u._id }),
          Todo.countDocuments({ user: u._id, completed: true }),
        ]);
        return {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          totalTasks,
          completedTasks,
          activeTasks: totalTasks - completedTasks,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: userStats,
      total: userStats.length,
    });
  } catch (err) {
    next(err);
  }
};

// ── Default Demo Users Seeder ────────────────────────────────────────────────
const seedDefaultUsers = async () => {
  try {
    // 1. Check or seed Admin
    let admin = await User.findOne({ email: 'admin@taskflow.dev' });
    if (!admin) {
      admin = await User.create({
        name: 'TaskFlow Admin',
        email: 'admin@taskflow.dev',
        password: 'Admin@123',
        role: 'admin',
      });
      console.log('🛡️  Default Admin created: admin@taskflow.dev / Admin@123');

      // Seed an admin task
      await Todo.create({
        title: 'Review System Health & Container Logs',
        description: 'Verify Docker deployment metrics and database indexes.',
        priority: 'high',
        user: admin._id,
        userName: admin.name,
        userEmail: admin.email,
        completed: false,
      });
    }

    // 2. Check or seed User
    let regularUser = await User.findOne({ email: 'user@taskflow.dev' });
    if (!regularUser) {
      regularUser = await User.create({
        name: 'Alex Johnson',
        email: 'user@taskflow.dev',
        password: 'User@123',
        role: 'user',
      });
      console.log('👤  Default User created: user@taskflow.dev / User@123');

      // Seed a sample task for user
      await Todo.create({
        title: 'Complete DevOps Pipeline Documentation',
        description: 'Outline GitHub Actions triggers, secrets, and deployment steps.',
        priority: 'medium',
        user: regularUser._id,
        userName: regularUser.name,
        userEmail: regularUser.email,
        completed: true,
      });
    }
  } catch (err) {
    console.warn('⚠️  Notice: User seeding skipped or already present:', err.message);
  }
};

module.exports = {
  register,
  login,
  getMe,
  getAllUsers,
  seedDefaultUsers,
};

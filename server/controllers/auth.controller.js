import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { inMemoryStore } from '../services/store.service.js';
import { getDBStatus } from '../config/db.js';
import bcrypt from 'bcryptjs';

const generateToken = (id, role, name, email) => {
  return jwt.sign(
    { id, role, name, email },
    process.env.JWT_SECRET || 'super_secret_jwt_key_docintellect_ai_2026_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, organization } = req.body;
    const isDbConnected = getDBStatus();

    if (isDbConnected) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email is already registered' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role || 'Claims Adjuster',
        organization: organization || 'Healthcare Claims Ops',
      });

      const token = generateToken(user._id, user.role, user.name, user.email);

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
        },
      });
    }

    // In-memory fallback
    const existing = inMemoryStore.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = inMemoryStore.addUser({
      _id: `user-${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      role: role || 'Claims Adjuster',
      organization: organization || 'Healthcare Claims Ops',
      createdAt: new Date().toISOString(),
    });

    const token = generateToken(newUser._id, newUser.role, newUser.name, newUser.email);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        organization: newUser.organization,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isDbConnected = getDBStatus();

    if (isDbConnected) {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user._id, user.role, user.name, user.email);
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
        },
      });
    }

    // In-memory fallback
    const user = inMemoryStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role, user.name, user.email);
    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

export const demoLogin = async (req, res) => {
  const role = req.body.role || 'Claims Adjuster';
  const demoUsers = {
    'Claims Adjuster': {
      id: 'demo-adjuster',
      name: 'Sarah Jenkins',
      email: 'adjuster@docintellect.ai',
      role: 'Claims Adjuster',
      organization: 'Aetna Health Care Claims',
    },
    'Medical Auditor': {
      id: 'demo-auditor',
      name: 'Dr. Marcus Vance',
      email: 'auditor@docintellect.ai',
      role: 'Medical Auditor',
      organization: 'BlueCross Special Investigations Unit',
    },
    'Administrator': {
      id: 'demo-admin',
      name: 'Alex Rivera',
      email: 'admin@docintellect.ai',
      role: 'Administrator',
      organization: 'DocIntellect System Operations',
    },
  };

  const user = demoUsers[role] || demoUsers['Claims Adjuster'];
  const token = generateToken(user.id, user.role, user.name, user.email);

  return res.json({
    success: true,
    token,
    user,
    isDemo: true,
  });
};

export const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
};

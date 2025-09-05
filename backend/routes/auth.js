const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const router = express.Router();

// Security constants
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  PASSWORD_HISTORY_SIZE: 3, // Remember last 3 passwords
  SESSION_TIMEOUT: 2 * 60 * 60 * 1000, // 2 hours
  REFRESH_TOKEN_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 days
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128
};

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'chick-n-needs-secret-key-2024';

// Track failed login attempts with enhanced security
const failedAttempts = new Map();
const passwordHistory = new Map(); // Track password history per user
const activeSessions = new Map(); // Track active sessions

// Mock database for users (in production, use real database)
let users = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
    role: 'customer',
    phone: '+63 912 345 6789',
    address: '123 Poultry Street, Manila, Philippines',
    farmType: 'Commercial',
    createdAt: new Date('2024-01-01'),
    wishlist: [],
    notifications: []
  }
];

// Input sanitization and security functions
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= SECURITY_CONFIG.MIN_PASSWORD_LENGTH && password.length <= SECURITY_CONFIG.MAX_PASSWORD_LENGTH,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
    noCommonPatterns: !/(123|abc|password|qwerty|admin)/i.test(password)
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  return { isValid: score >= 5, score, checks };
};

const checkPasswordHistory = async (userId, newPassword) => {
  const history = passwordHistory.get(userId) || [];
  for (const oldHash of history) {
    if (await bcrypt.compare(newPassword, oldHash)) {
      return false; // Password was used before
    }
  }
  return true; // Password is new
};

const addToPasswordHistory = (userId, passwordHash) => {
  const history = passwordHistory.get(userId) || [];
  history.push(passwordHash);
  if (history.length > SECURITY_CONFIG.PASSWORD_HISTORY_SIZE) {
    history.shift(); // Remove oldest password
  }
  passwordHistory.set(userId, history);
};

// Enhanced validation middleware with security improvements
const validateRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, apostrophes, and periods')
    .escape(),

  body('lastName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, apostrophes, and periods')
    .escape(),

  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_\.]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and periods')
    .toLowerCase(),

  body('email')
    .isEmail()
    .normalizeEmail()
    .trim()
    .isLength({ max: 254 })
    .withMessage('Email must be less than 254 characters')
    .toLowerCase()
    .withMessage('Email must be lowercase'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'),
  
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .trim()
    .isLength({ max: 254 })
    .withMessage('Email must be less than 254 characters')
    .toLowerCase()
    .withMessage('Email must be lowercase'),

  body('password')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 128 })
    .withMessage('Password is required and must be less than 128 characters')
];

// Register new user
router.post('/register', securityMiddleware, validateRegistration, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { firstName, lastName, username, email, password } = req.body;

    // Additional security checks
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Password does not meet security requirements',
        details: passwordValidation.checks
      });
    }

    // Check for common weak passwords
    const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (weakPasswords.includes(password.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Password is too common. Please choose a stronger password.'
      });
    }

    // Check if user already exists in database (email and/or username)
    const [conflicts] = await pool.execute(
      'SELECT email, username FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (conflicts.length > 0) {
      let emailExists = false;
      let usernameExists = false;
      for (const row of conflicts) {
        if (row.email === email) emailExists = true;
        if (row.username === username) usernameExists = true;
      }

      const errors = [];
      if (emailExists) errors.push({ msg: 'Email is already registered' });
      if (usernameExists) errors.push({ msg: 'Username is already taken' });

      return res.status(400).json({
        success: false,
        ...(errors.length > 0 ? { errors } : { error: 'Email or username already in use' })
      });
    }

    // Hash password with higher salt rounds for better security
    const saltRounds = 14; // Increased from 12 for better security
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate UUID for user
    const userId = uuidv4();
    const fullName = `${firstName} ${lastName}`.trim();

    // Insert new user into database
    await pool.execute(
      `INSERT INTO users (id, first_name, last_name, username, name, email, password, birthday, phone, address, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, '', '', 'customer')`,
      [userId, firstName, lastName, username, fullName, email, hashedPassword]
    );

    // Create new user object for response
    const newUser = {
      id: userId,
      name: fullName,
      first_name: firstName,
      last_name: lastName,
      username,
      email,
      role: 'customer',
      phone: '',
      address: '',
      farmType: '',
      birthday: null,
      createdAt: new Date()
    };

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
});

// Login user with enhanced security
router.post('/login', securityMiddleware, validateLogin, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    // Enhanced IP lockout with rate limiting
    const lockoutInfo = failedAttempts.get(clientIP);
    if (lockoutInfo && lockoutInfo.lockedUntil > Date.now()) {
      const remainingTime = Math.ceil((lockoutInfo.lockedUntil - Date.now()) / 1000 / 60);
      return res.status(429).json({ 
        success: false,
        error: 'Account temporarily locked',
        message: `Too many failed attempts. Try again in ${remainingTime} minutes.`,
        lockedUntil: lockoutInfo.lockedUntil,
        remainingAttempts: 0
      });
    }

    // Additional security: Check for suspicious activity patterns
    const suspiciousPatterns = {
      rapidRequests: lockoutInfo && (Date.now() - lockoutInfo.lastAttempt) < 1000, // Less than 1 second between attempts
      multipleIPs: lockoutInfo && lockoutInfo.attempts > 3 && lockoutInfo.attempts % 3 === 0
    };

    if (suspiciousPatterns.rapidRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many rapid requests. Please slow down.',
        remainingAttempts: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - (lockoutInfo?.attempts || 0)
      });
    }

    // Find user by email in database
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Enhanced failed attempts tracking
      const attempts = (failedAttempts.get(clientIP)?.attempts || 0) + 1;
      const lastAttempt = Date.now();
      
      if (attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        failedAttempts.set(clientIP, {
          attempts,
          lockedUntil: Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION,
          lastAttempt,
          suspicious: true
        });
        return res.status(429).json({ 
          success: false,
          error: 'Account temporarily locked',
          message: 'Too many failed attempts. Account locked for 15 minutes.',
          lockedUntil: Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION,
          remainingAttempts: 0
        });
      }
      
      failedAttempts.set(clientIP, { 
        attempts, 
        lockedUntil: 0, 
        lastAttempt,
        suspicious: attempts > 2
      });
      
      return res.status(401).json({
        success: false,
        error: 'Account does not exist',
        message: 'No account found with this email address. Please check your email or create a new account.',
        remainingAttempts: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - attempts
      });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Enhanced failed attempts tracking
      const attempts = (failedAttempts.get(clientIP)?.attempts || 0) + 1;
      const lastAttempt = Date.now();
      
      if (attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        failedAttempts.set(clientIP, {
          attempts,
          lockedUntil: Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION,
          lastAttempt,
          suspicious: true
        });
        return res.status(429).json({ 
          success: false,
          error: 'Account temporarily locked',
          message: 'Too many failed attempts. Account locked for 15 minutes.',
          lockedUntil: Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION,
          remainingAttempts: 0
        });
      }
      
      failedAttempts.set(clientIP, { 
        attempts, 
        lockedUntil: 0, 
        lastAttempt,
        suspicious: attempts > 2
      });
      
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        remainingAttempts: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - attempts
      });
    }

    // Reset failed attempts on successful login
    failedAttempts.delete(clientIP);

    // Create JWT token with enhanced security
    const sessionId = uuidv4();
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        sessionId
      },
      JWT_SECRET,
      { 
        expiresIn: SECURITY_CONFIG.SESSION_TIMEOUT / 1000,
        issuer: 'chick-n-needs',
        audience: 'chick-n-needs-users',
        algorithm: 'HS256'
      }
    );

    // Track active session
    activeSessions.set(sessionId, {
      userId: user.id,
      email: user.email,
      ip: clientIP,
      userAgent: req.get('User-Agent'),
      createdAt: Date.now(),
      lastActivity: Date.now()
    });

    // Generate refresh token
    const refreshToken = jwt.sign(
      { 
        userId: user.id,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Set secure HTTP-only cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token,
      expiresIn: 7200 // 2 hours in seconds
    });

  } catch (error) {
    console.error('Login error:', error.stack || error);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? (error.message || 'Login failed') : 'Login failed. Please try again.'
    });
  }
});

// Refresh token route
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies && req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    if (decoded.type !== 'refresh') {
      return res.status(403).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Find user in database
    const [rows] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    const user = rows[0];

    // Generate new access token
    const newToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role
      },
      JWT_SECRET,
      { 
        expiresIn: '2h',
        issuer: 'chick-n-needs',
        audience: 'chick-n-needs-users'
      }
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken,
      expiresIn: 7200
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, first_name, last_name, username, name, email, phone, address, birthday, role, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];

    res.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('phone').optional().matches(/^[\+]?[0-9\s\-()]{7,20}$/),
  body('address').optional().trim().isLength({ min: 5 }),
  body('birthday').optional().isISO8601().toDate()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { phone, address, birthday } = req.body;
    
    // Update user data in database
    await pool.execute(
      `UPDATE users SET phone = ?, address = ?, birthday = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [phone, address, birthday || null, req.user.userId]
    );

    // Get updated user data
    const [users] = await pool.execute(
      'SELECT id, first_name, last_name, username, name, email, phone, address, birthday, role, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const updatedUser = users[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// Enhanced middleware to authenticate JWT token with security checks
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { 
      algorithms: ['HS256'],
      issuer: 'chick-n-needs',
      audience: 'chick-n-needs-users'
    });

    // Check if session is still active
    const session = activeSessions.get(decoded.sessionId);
    if (!session) {
      return res.status(403).json({
        success: false,
        error: 'Session expired or invalid'
      });
    }

    // Update last activity
    session.lastActivity = Date.now();
    activeSessions.set(decoded.sessionId, session);

    // Check for suspicious activity
    const clientIP = req.ip || req.connection.remoteAddress;
    if (session.ip !== clientIP) {
      // IP changed - could be session hijacking
      console.warn(`Potential session hijacking detected for user ${decoded.userId}. Original IP: ${session.ip}, Current IP: ${clientIP}`);
      
      // In production, you might want to invalidate the session here
      // activeSessions.delete(decoded.sessionId);
      // return res.status(403).json({ success: false, error: 'Session security violation' });
    }

    req.user = decoded;
    req.session = session;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        error: 'Token expired'
      });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        error: 'Invalid token'
      });
    } else {
      return res.status(403).json({
        success: false,
        error: 'Token verification failed'
      });
    }
  }
}

// Security middleware for rate limiting and input validation
function securityMiddleware(req, res, next) {
  // Set security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  });

  // Sanitize all string inputs
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }

  next();
}

module.exports = router;

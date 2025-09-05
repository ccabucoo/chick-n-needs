const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Rate limiting for contact form submissions
// Allow 3 submissions per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Maximum 3 submissions per window
  message: {
    error: 'Too many contact form submissions. Please try again in 15 minutes.',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, successful or not
  keyGenerator: (req) => {
    // Use IP address as the key for rate limiting
    return req.ip || req.connection.remoteAddress;
  }
});

// Enhanced input validation and sanitization
const validateContactForm = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, apostrophes, and periods')
    .custom((value) => {
      if (value.split(' ').length < 2) {
        throw new Error('Please enter your full name (first and last name)');
      }
      return true;
    })
    .escape(), // Sanitize HTML characters
  
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ min: 5, max: 255 })
    .withMessage('Email address must be between 5 and 255 characters')
    .custom((value) => {
      if (value.includes('..') || value.startsWith('.') || value.endsWith('.')) {
        throw new Error('Email address format is invalid');
      }
      if (value.split('@')[0].length < 2) {
        throw new Error('Email username must be at least 2 characters');
      }
      return true;
    }),
  
  body('concernType')
    .isIn(['general', 'product_inquiry', 'order_support', 'technical_issue', 'billing', 'partnership', 'feedback', 'complaint'])
    .withMessage('Please select a valid concern type'),
  
  body('subject')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Subject must be between 5 and 255 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,!?()]+$/)
    .withMessage('Subject contains invalid characters')
    .custom((value) => {
      if (value.split(' ').length < 2) {
        throw new Error('Subject must be more descriptive (at least 2 words)');
      }
      if (!/[a-zA-Z0-9]/.test(value)) {
        throw new Error('Subject must contain at least one letter or number');
      }
      return true;
    })
    .escape(), // Sanitize HTML characters
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
    .custom((value) => {
      if (value.split(' ').length < 3) {
        throw new Error('Message must be more descriptive (at least 3 words)');
      }
      if (!/[a-zA-Z0-9]/.test(value)) {
        throw new Error('Message must contain at least one letter or number');
      }
      if (value.split('\n').length > 20) {
        throw new Error('Message has too many line breaks');
      }
      return true;
    })
    .escape() // Sanitize HTML characters
];

// Get concern types (for dropdown)
router.get('/concern-types', (req, res) => {
  try {
    const concernTypes = [
      { value: 'general', label: 'General Inquiry' },
      { value: 'product_inquiry', label: 'Product Inquiry' },
      { value: 'order_support', label: 'Order Support' },
      { value: 'technical_issue', label: 'Technical Issue' },
      { value: 'billing', label: 'Billing Question' },
      { value: 'partnership', label: 'Partnership Opportunity' },
      { value: 'feedback', label: 'Feedback & Suggestions' },
      { value: 'complaint', label: 'Complaint' }
    ];
    
    res.json({
      success: true,
      data: concernTypes
    });
  } catch (error) {
    console.error('Error fetching concern types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch concern types'
    });
  }
});

// Submit contact form
router.post('/submit', contactLimiter, validateContactForm, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email, concernType, subject, message } = req.body;
    const submissionId = uuidv4();
    
    // Determine priority based on concern type
    let priority = 'medium';
    if (['complaint', 'technical_issue'].includes(concernType)) {
      priority = 'high';
    } else if (['billing', 'order_support'].includes(concernType)) {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    // Insert submission into database
    const query = `
      INSERT INTO contact_submissions 
      (id, name, email, concern_type, subject, message, priority, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'new')
    `;
    
    const values = [submissionId, name, email, concernType, subject, message, priority];
    
    await pool.execute(query, values);
    
    // Log successful submission
    console.log(`Contact form submitted: ${submissionId} - ${concernType} - ${email}`);
    
    res.status(201).json({
      success: true,
      message: 'Your message has been submitted successfully. We will get back to you within 24 hours.',
      submissionId: submissionId
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(503).json({
        success: false,
        error: 'Service temporarily unavailable. Please try again later.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to submit your message. Please try again later.'
    });
  }
});

// Get contact submissions (admin only - for future use)
router.get('/submissions', async (req, res) => {
  try {
    // This would require admin authentication in a real application
    const query = `
      SELECT id, name, email, concern_type, subject, message, status, priority, created_at 
      FROM contact_submissions 
      ORDER BY created_at DESC 
      LIMIT 100
    `;
    
    const [rows] = await pool.execute(query);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact submissions'
    });
  }
});

// Get submission by ID (admin only - for future use)
router.get('/submissions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT id, name, email, concern_type, subject, message, status, priority, admin_notes, created_at, updated_at 
      FROM contact_submissions 
      WHERE id = ?
    `;
    
    const [rows] = await pool.execute(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching contact submission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact submission'
    });
  }
});

module.exports = router;

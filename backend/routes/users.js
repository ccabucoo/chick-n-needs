const express = require('express');
const router = express.Router();

// Mock database for users (in production, use real database)
let users = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    phone: '+63 912 345 6789',
    address: '123 Poultry Street, Manila, Philippines',
    farmType: 'Commercial',
    createdAt: new Date('2024-01-01'),
    wishlist: [],
    notifications: [
      {
        id: '1',
        type: 'order',
        title: 'Order #12345 Confirmed',
        message: 'Your order has been confirmed and is being processed.',
        isRead: false,
        createdAt: new Date('2024-01-20')
      },
      {
        id: '2',
        type: 'promotion',
        title: 'Special Offer: 20% Off Feeds',
        message: 'Get 20% off on all feed products this week!',
        isRead: false,
        createdAt: new Date('2024-01-19')
      }
    ]
  }
];

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  // For demo purposes, we'll use a simple token validation
  if (token === 'demo-token') {
    req.user = { userId: '1' };
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Invalid token'
    });
  }
}

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { password, ...userProfile } = user;

    res.json({
      success: true,
      data: userProfile
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
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.user.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { name, phone, address, farmType } = req.body;

    // Update user fields
    if (name) users[userIndex].name = name;
    if (phone) users[userIndex].phone = phone;
    if (address) users[userIndex].address = address;
    if (farmType) users[userIndex].farmType = farmType;

    const { password, ...updatedProfile } = users[userIndex];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// Get user notifications
router.get('/notifications', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.notifications
    });

  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.user.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const notificationId = req.params.id;
    const notificationIndex = users[userIndex].notifications.findIndex(
      n => n.id === notificationId
    );

    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    users[userIndex].notifications[notificationIndex].isRead = true;

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: users[userIndex].notifications
    });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', authenticateToken, (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.user.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    users[userIndex].notifications.forEach(notification => {
      notification.isRead = true;
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: users[userIndex].notifications
    });

  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read'
    });
  }
});

// Delete notification
router.delete('/notifications/:id', authenticateToken, (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.user.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const notificationId = req.params.id;
    const notificationIndex = users[userIndex].notifications.findIndex(
      n => n.id === notificationId
    );

    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    users[userIndex].notifications.splice(notificationIndex, 1);

    res.json({
      success: true,
      message: 'Notification deleted successfully',
      data: users[userIndex].notifications
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    });
  }
});

// Get unread notifications count
router.get('/notifications/unread-count', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const unreadCount = user.notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      data: { unreadCount }
    });

  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count'
    });
  }
});

module.exports = router;

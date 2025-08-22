const express = require('express');
const router = express.Router();

// Mock database for carts (in production, use real database)
let carts = {};

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
  // In production, use proper JWT verification
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

// Get user's cart
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const userCart = carts[userId] || { items: [], wishlist: [] };

    res.json({
      success: true,
      data: userCart
    });

  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart'
    });
  }
});

// Add item to cart
router.post('/add', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    if (!carts[userId]) {
      carts[userId] = { items: [], wishlist: [] };
    }

    // Check if item already exists in cart
    const existingItemIndex = carts[userId].items.findIndex(
      item => item.productId === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      carts[userId].items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      carts[userId].items.push({
        productId,
        quantity,
        addedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: carts[userId]
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart'
    });
  }
});

// Update cart item quantity
router.put('/update/:productId', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!carts[userId]) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    const itemIndex = carts[userId].items.findIndex(
      item => item.productId === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart'
      });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      carts[userId].items.splice(itemIndex, 1);
    } else {
      // Update quantity
      carts[userId].items[itemIndex].quantity = quantity;
    }

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: carts[userId]
    });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update cart'
    });
  }
});

// Remove item from cart
router.delete('/remove/:productId', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    if (!carts[userId]) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    const itemIndex = carts[userId].items.findIndex(
      item => item.productId === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart'
      });
    }

    carts[userId].items.splice(itemIndex, 1);

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: carts[userId]
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart'
    });
  }
});

// Clear cart
router.delete('/clear', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;

    if (!carts[userId]) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    carts[userId].items = [];

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: carts[userId]
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart'
    });
  }
});

// Add item to wishlist
router.post('/wishlist/add', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    if (!carts[userId]) {
      carts[userId] = { items: [], wishlist: [] };
    }

    // Check if item already exists in wishlist
    const existingItem = carts[userId].wishlist.find(
      item => item.productId === productId
    );

    if (existingItem) {
      return res.status(400).json({
        success: false,
        error: 'Item already in wishlist'
      });
    }

    // Add to wishlist
    carts[userId].wishlist.push({
      productId,
      addedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Item added to wishlist successfully',
      data: carts[userId]
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to wishlist'
    });
  }
});

// Remove item from wishlist
router.delete('/wishlist/remove/:productId', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    if (!carts[userId]) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist not found'
      });
    }

    const itemIndex = carts[userId].wishlist.findIndex(
      item => item.productId === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in wishlist'
      });
    }

    carts[userId].wishlist.splice(itemIndex, 1);

    res.json({
      success: true,
      message: 'Item removed from wishlist successfully',
      data: carts[userId]
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from wishlist'
    });
  }
});

// Move item from wishlist to cart
router.post('/wishlist/move-to-cart/:productId', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { quantity = 1 } = req.body;

    if (!carts[userId]) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist not found'
      });
    }

    const wishlistIndex = carts[userId].wishlist.findIndex(
      item => item.productId === productId
    );

    if (wishlistIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in wishlist'
      });
    }

    // Remove from wishlist
    carts[userId].wishlist.splice(wishlistIndex, 1);

    // Add to cart
    const existingItemIndex = carts[userId].items.findIndex(
      item => item.productId === productId
    );

    if (existingItemIndex > -1) {
      carts[userId].items[existingItemIndex].quantity += quantity;
    } else {
      carts[userId].items.push({
        productId,
        quantity,
        addedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Item moved from wishlist to cart successfully',
      data: carts[userId]
    });

  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to move item to cart'
    });
  }
});

// Get cart summary (total items, total price)
router.get('/summary', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const userCart = carts[userId] || { items: [], wishlist: [] };

    // Calculate totals (in production, fetch actual product prices)
    const totalItems = userCart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = userCart.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    const wishlistCount = userCart.wishlist.length;

    res.json({
      success: true,
      data: {
        totalItems,
        totalPrice,
        wishlistCount,
        itemCount: userCart.items.length
      }
    });

  } catch (error) {
    console.error('Cart summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cart summary'
    });
  }
});

module.exports = router;

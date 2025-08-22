const express = require('express');
const router = express.Router();

// Mock database for orders (in production, use real database)
let orders = [
  {
    id: '12345',
    userId: '1',
    items: [
      {
        productId: '1',
        name: 'Broiler Chicks (Day Old)',
        price: 45.00,
        quantity: 50,
        total: 2250.00
      },
      {
        productId: '4',
        name: 'Broiler Starter Feed (0-21 days)',
        price: 1250.00,
        quantity: 2,
        total: 2500.00
      }
    ],
    status: 'confirmed',
    totalAmount: 4750.00,
    shippingAddress: '123 Poultry Street, Manila, Philippines',
    paymentMethod: 'GCash',
    paymentStatus: 'paid',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    estimatedDelivery: new Date('2024-01-25'),
    trackingNumber: 'TRK123456789'
  },
  {
    id: '12346',
    userId: '1',
    items: [
      {
        productId: '7',
        name: 'Automatic Poultry Drinker (10L)',
        price: 180.00,
        quantity: 5,
        total: 900.00
      }
    ],
    status: 'delivered',
    totalAmount: 900.00,
    shippingAddress: '123 Poultry Street, Manila, Philippines',
    paymentMethod: 'PayMaya',
    paymentStatus: 'paid',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-18'),
    deliveredAt: new Date('2024-01-18'),
    trackingNumber: 'TRK987654321'
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

// Get user's orders
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const userOrders = orders.filter(order => order.userId === userId);

    res.json({
      success: true,
      data: userOrders
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// Get single order by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.id;
    
    const order = orders.find(o => o.id === orderId && o.userId === userId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
});

// Create new order
router.post('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order items are required'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        error: 'Shipping address is required'
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Payment method is required'
      });
    }

    // Calculate totals
    const orderItems = items.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      total: item.price * item.quantity
    }));

    const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);

    // Create new order
    const newOrder = {
      id: Date.now().toString(),
      userId,
      items: orderItems,
      status: 'pending',
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      trackingNumber: `TRK${Date.now()}`
    };

    orders.push(newOrder);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
});

// Update order status (for admin use, but included here for demo)
router.put('/:id/status', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.id;
    const { status } = req.body;
    
    const orderIndex = orders.findIndex(o => o.id === orderId && o.userId === userId);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order status'
      });
    }

    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date();

    // Add delivery date if status is delivered
    if (status === 'delivered') {
      orders[orderIndex].deliveredAt = new Date();
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: orders[orderIndex]
    });

  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
});

// Cancel order
router.put('/:id/cancel', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.id;
    
    const orderIndex = orders.findIndex(o => o.id === orderId && o.userId === userId);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const order = orders[orderIndex];

    // Check if order can be cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Order cannot be cancelled'
      });
    }

    order.status = 'cancelled';
    order.updatedAt = new Date();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error) {
    console.error('Order cancellation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel order'
    });
  }
});

// Get order statistics
router.get('/stats/summary', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const userOrders = orders.filter(order => order.userId === userId);

    const stats = {
      totalOrders: userOrders.length,
      totalSpent: userOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      ordersByStatus: {
        pending: userOrders.filter(o => o.status === 'pending').length,
        confirmed: userOrders.filter(o => o.status === 'confirmed').length,
        processing: userOrders.filter(o => o.status === 'processing').length,
        shipped: userOrders.filter(o => o.status === 'shipped').length,
        delivered: userOrders.filter(o => o.status === 'delivered').length,
        cancelled: userOrders.filter(o => o.status === 'cancelled').length
      },
      averageOrderValue: userOrders.length > 0 
        ? userOrders.reduce((sum, order) => sum + order.totalAmount, 0) / userOrders.length 
        : 0
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Order stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get order statistics'
    });
  }
});

// Get recent orders (last 5)
router.get('/recent/orders', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const userOrders = orders
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      success: true,
      data: userOrders
    });

  } catch (error) {
    console.error('Recent orders fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent orders'
    });
  }
});

module.exports = router;

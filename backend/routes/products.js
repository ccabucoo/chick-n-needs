const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock database for products (in production, use real database)
let products = [
  // Feeds & Supplements
  {
    id: '4',
    name: 'Broiler Starter Feed (0-21 days)',
    category: 'Feeds & Supplements',
    subcategory: 'Broiler Feed',
    price: 1250.00,
    originalPrice: 1300.00,
    stock: 100,
    unit: '25kg bag',
    description: 'Complete starter feed for broiler chicks from 0-21 days. High protein content for optimal growth.',
    specifications: {
      protein: '22-24%',
      energy: '3000 kcal/kg',
      ingredients: 'Corn, soybean meal, fish meal, vitamins, minerals',
      feeding: 'Ad libitum (free choice)',
      packaging: '25kg woven polypropylene bags'
    },
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'
    ],
    tags: ['broiler', 'starter', 'high-protein', 'complete-feed'],
    rating: 4.6,
    reviews: 234,
    isPopular: true,
    isNew: false,
    isOnSale: true,
    salePercentage: 4,
    createdAt: new Date('2024-01-12')
  },
  {
    id: '5',
    name: 'Layer Mash (18% Protein)',
    category: 'Feeds & Supplements',
    subcategory: 'Layer Feed',
    price: 1150.00,
    originalPrice: 1200.00,
    stock: 150,
    unit: '25kg bag',
    description: 'Complete layer feed formulated for maximum egg production. Contains essential nutrients for healthy layers.',
    specifications: {
      protein: '18%',
      energy: '2800 kcal/kg',
      ingredients: 'Corn, soybean meal, rice bran, calcium, vitamins',
      feeding: '110-120g per bird per day',
      packaging: '25kg woven polypropylene bags'
    },
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      'https://images.unsplash.com/photo-1548550023-2bdb3c5be0e7?w=400'
    ],
    tags: ['layer', 'egg-production', 'complete-feed', 'calcium'],
    rating: 4.8,
    reviews: 189,
    isPopular: true,
    isNew: false,
    isOnSale: true,
    salePercentage: 4,
    createdAt: new Date('2024-01-08')
  },
  {
    id: '6',
    name: 'Vitamin & Mineral Premix',
    category: 'Feeds & Supplements',
    subcategory: 'Supplements',
    price: 450.00,
    originalPrice: 500.00,
    stock: 75,
    unit: '1kg pack',
    description: 'Essential vitamin and mineral supplement for all types of poultry. Improves health and productivity.',
    specifications: {
      vitamins: 'A, D3, E, K, B-complex',
      minerals: 'Calcium, phosphorus, zinc, manganese, copper',
      dosage: '1-2% of total feed',
      shelfLife: '24 months',
      packaging: '1kg aluminum foil pouches'
    },
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'
    ],
    tags: ['vitamins', 'minerals', 'supplement', 'health'],
    rating: 4.9,
    reviews: 123,
    isPopular: false,
    isNew: true,
    isOnSale: true,
    salePercentage: 10,
    createdAt: new Date('2024-01-20')
  },

  // Equipment & Supplies
  {
    id: '7',
    name: 'Automatic Poultry Drinker (10L)',
    category: 'Equipment & Supplies',
    subcategory: 'Watering Systems',
    price: 180.00,
    originalPrice: 200.00,
    stock: 50,
    unit: 'piece',
    description: 'Automatic poultry drinker with 10L capacity. Prevents water wastage and keeps water clean.',
    specifications: {
      capacity: '10 liters',
      material: 'Food-grade plastic',
      birds: 'Up to 50 birds',
      installation: 'Hanging or ground mount',
      maintenance: 'Easy to clean and refill'
    },
    images: [
      'https://images.unsplash.com/photo-1548550023-2bdb3c5be0e7?w=400',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
    ],
    tags: ['automatic', 'waterer', 'clean-water', 'easy-maintenance'],
    rating: 4.7,
    reviews: 78,
    isPopular: false,
    isNew: false,
    isOnSale: true,
    salePercentage: 10,
    createdAt: new Date('2024-01-14')
  },
  {
    id: '8',
    name: 'Poultry Feeder (5kg capacity)',
    category: 'Equipment & Supplies',
    subcategory: 'Feeding Systems',
    price: 120.00,
    originalPrice: 120.00,
    stock: 80,
    unit: 'piece',
    description: 'Durable poultry feeder with 5kg capacity. Prevents feed wastage and contamination.',
    specifications: {
      capacity: '5kg feed',
      material: 'Galvanized steel',
      birds: 'Up to 30 birds',
      design: 'Anti-waste design',
      durability: 'Rust-resistant coating'
    },
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      'https://images.unsplash.com/photo-1548550023-2bdb3c5be0e7?w=400'
    ],
    tags: ['feeder', 'anti-waste', 'durable', 'galvanized'],
    rating: 4.6,
    reviews: 92,
    isPopular: false,
    isNew: false,
    isOnSale: false,
    salePercentage: 0,
    createdAt: new Date('2024-01-06')
  },
  {
    id: '9',
    name: 'Poultry Netting (50m x 1.5m)',
    category: 'Equipment & Supplies',
    subcategory: 'Fencing',
    price: 850.00,
    originalPrice: 900.00,
    stock: 25,
    unit: 'roll',
    description: 'High-quality poultry netting for secure fencing. UV-resistant and weather-proof.',
    specifications: {
      dimensions: '50m x 1.5m',
      material: 'UV-stabilized polypropylene',
      meshSize: '2.5cm x 2.5cm',
      strength: 'High tensile strength',
      weather: 'UV and weather resistant'
    },
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'
    ],
    tags: ['netting', 'fencing', 'uv-resistant', 'weather-proof'],
    rating: 4.5,
    reviews: 45,
    isPopular: false,
    isNew: false,
    isOnSale: true,
    salePercentage: 6,
    createdAt: new Date('2024-01-11')
  },

  // Health & Medicine
  {
    id: '10',
    name: 'Poultry Dewormer (Broad Spectrum)',
    category: 'Health & Medicine',
    subcategory: 'Dewormers',
    price: 280.00,
    originalPrice: 300.00,
    stock: 60,
    unit: '100ml bottle',
    description: 'Broad-spectrum dewormer for all types of poultry. Effective against roundworms and tapeworms.',
    specifications: {
      activeIngredient: 'Levamisole HCl',
      dosage: '1ml per liter of water',
      treatment: 'Single dose treatment',
      withdrawal: '7 days before slaughter',
      packaging: '100ml amber glass bottle'
    },
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      'https://images.unsplash.com/photo-1548550023-2bdb3c5be0e7?w=400'
    ],
    tags: ['dewormer', 'broad-spectrum', 'levamisole', 'treatment'],
    rating: 4.8,
    reviews: 156,
    isPopular: true,
    isNew: false,
    isOnSale: true,
    salePercentage: 7,
    createdAt: new Date('2024-01-13')
  },
  {
    id: '11',
    name: 'Poultry Antibiotic (Respiratory)',
    category: 'Health & Medicine',
    subcategory: 'Antibiotics',
    price: 420.00,
    originalPrice: 450.00,
    stock: 40,
    unit: '100g pack',
    description: 'Effective antibiotic for respiratory infections in poultry. Fast-acting and safe when used properly.',
    specifications: {
      activeIngredient: 'Tylosin',
      dosage: '1g per liter of water',
      duration: '3-5 days treatment',
      withdrawal: '5 days before slaughter',
      packaging: '100g foil pouch'
    },
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'
    ],
    tags: ['antibiotic', 'respiratory', 'tylosin', 'infection'],
    rating: 4.7,
    reviews: 89,
    isPopular: false,
    isNew: false,
    isOnSale: true,
    salePercentage: 7,
    createdAt: new Date('2024-01-09')
  },
  {
    id: '12',
    name: 'Poultry Vaccine (Newcastle Disease)',
    category: 'Health & Medicine',
    subcategory: 'Vaccines',
    price: 180.00,
    originalPrice: 200.00,
    stock: 100,
    unit: '100 doses',
    description: 'Live vaccine for Newcastle Disease prevention. Essential for poultry health and disease prevention.',
    specifications: {
      type: 'Live attenuated vaccine',
      dosage: '1 drop per bird',
      administration: 'Eye drop or drinking water',
      protection: '6-8 months immunity',
      storage: 'Refrigerated (2-8°C)'
    },
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      'https://images.unsplash.com/photo-1548550023-2bdb3c5be0e7?w=400'
    ],
    tags: ['vaccine', 'newcastle', 'disease-prevention', 'immunity'],
    rating: 4.9,
    reviews: 234,
    isPopular: true,
    isNew: false,
    isOnSale: true,
    salePercentage: 10,
    createdAt: new Date('2024-01-07')
  }
];

// Get all products with filtering, sorting, and pagination
router.get('/', (req, res) => {
  try {
    let filteredProducts = [...products];
    const { 
      search, 
      category, 
      subcategory, 
      minPrice, 
      maxPrice, 
      sortBy, 
      sortOrder = 'asc',
      page = 1,
      limit = 12,
      tags,
      isPopular,
      isNew,
      isOnSale
    } = req.query;

    // Search functionality
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Category filter
    if (category) {
      filteredProducts = filteredProducts.filter(product => 
        product.category === category
      );
    }

    // Subcategory filter
    if (subcategory) {
      filteredProducts = filteredProducts.filter(product => 
        product.subcategory === subcategory
      );
    }

    // Price range filter
    if (minPrice) {
      filteredProducts = filteredProducts.filter(product => 
        product.price >= parseFloat(minPrice)
      );
    }
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(product => 
        product.price <= parseFloat(maxPrice)
      );
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filteredProducts = filteredProducts.filter(product =>
        product.tags.some(tag => tagArray.includes(tag))
      );
    }

    // Popular filter
    if (isPopular === 'true') {
      filteredProducts = filteredProducts.filter(product => product.isPopular);
    }

    // New filter
    if (isNew === 'true') {
      filteredProducts = filteredProducts.filter(product => product.isNew);
    }

    // Sale filter
    if (isOnSale === 'true') {
      filteredProducts = filteredProducts.filter(product => product.isOnSale);
    }

    // Sorting
    if (sortBy) {
      filteredProducts.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'price') {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }

        if (sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    }

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Get unique categories and subcategories for filters
    const categories = [...new Set(products.map(p => p.category))];
    const subcategories = [...new Set(products.map(p => p.subcategory))];
    const allTags = [...new Set(products.flatMap(p => p.tags))];

    res.json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredProducts.length / parseInt(limit)),
          totalProducts: filteredProducts.length,
          productsPerPage: parseInt(limit)
        },
        filters: {
          categories,
          subcategories,
          tags: allTags,
          priceRange: {
            min: Math.min(...products.map(p => p.price)),
            max: Math.max(...products.map(p => p.price))
          }
        }
      }
    });

  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// Get single product by ID
router.get('/:id', (req, res) => {
  try {
    const product = products.find(p => p.id === req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Get related products (same category)
    const relatedProducts = products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);

    res.json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    });

  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

// Get featured products (popular, new, on sale)
router.get('/featured/featured', (req, res) => {
  try {
    const featuredProducts = products.filter(p => 
      p.isPopular || p.isNew || p.isOnSale
    ).slice(0, 8);

    res.json({
      success: true,
      data: featuredProducts
    });

  } catch (error) {
    console.error('Featured products fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured products'
    });
  }
});

// Get products by category
router.get('/category/:category', (req, res) => {
  try {
    const categoryProducts = products.filter(p => 
      p.category === req.params.category
    );

    res.json({
      success: true,
      data: categoryProducts
    });

  } catch (error) {
    console.error('Category products fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category products'
    });
  }
});

module.exports = router;

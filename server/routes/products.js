const express = require('express');
const router = express.Router();
const { Product } = require('../models/schemas');
const { isMongoConnected, memoryDB, generateId } = require('../db/store');
const { generateProductDescription } = require('../services/ai');

// Get all products with search & filters
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, color, fabricType, status, sort, minGsm, maxGsm } = req.query;

    if (isMongoConnected()) {
      let query = {};
      if (category && category !== 'All') query.category = category;
      if (status) query.status = status;

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      if (color) {
        query.colors = { $in: [new RegExp(color, 'i')] };
      }

      let products = await Product.find(query);
      return res.json(products);
    } else {
      // In-Memory filtering
      let list = [...memoryDB.products];

      if (category && category !== 'All') {
        list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      if (status) {
        list = list.filter(p => p.status === status);
      }
      if (search) {
        const s = search.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s) || p.category.toLowerCase().includes(s));
      }
      if (minPrice) list = list.filter(p => p.price >= Number(minPrice));
      if (maxPrice) list = list.filter(p => p.price <= Number(maxPrice));

      if (color) {
        list = list.filter(p => p.colors && p.colors.some(c => c.toLowerCase().includes(color.toLowerCase())));
      }

      if (minGsm) list = list.filter(p => (p.specifications?.gsm || 200) >= Number(minGsm));
      if (maxGsm) list = list.filter(p => (p.specifications?.gsm || 200) <= Number(maxGsm));

      if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
      if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
      if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);

      return res.json(list);
    }
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      const p = await Product.findById(id);
      if (!p) return res.status(404).json({ error: 'Product not found' });
      return res.json(p);
    } else {
      const p = memoryDB.products.find(item => item._id === id || item.id === id);
      if (!p) return res.status(404).json({ error: 'Product not found' });
      return res.json(p);
    }
  } catch (err) {
    res.status(500).json({ error: 'Error fetching product' });
  }
});

// Supplier: Add new product
router.post('/', async (req, res) => {
  try {
    const { supplierId, supplierName, name, category, description, images, colors, specifications, stockQuantity, price, moq } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    const newProdData = {
      supplierId: supplierId || 'supplier_demo',
      supplierName: supplierName || 'Vanguard Textile Mills',
      name,
      category,
      description: description || 'High quality textile fabric designed for commercial apparel manufacturing.',
      images: images && images.length ? images : ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80'],
      colors: colors || ['Indigo', 'White', 'Black'],
      specifications: specifications || { gsm: 220, composition: '100% Cotton', weaveType: 'Twill', width: '58 inches' },
      stockQuantity: stockQuantity ? Number(stockQuantity) : 1000,
      price: Number(price),
      moq: moq ? Number(moq) : 50,
      status: stockQuantity > 0 ? 'available' : 'out_of_stock',
      rating: 4.8,
      createdAt: new Date()
    };

    if (isMongoConnected()) {
      const product = await Product.create(newProdData);
      return res.json(product);
    } else {
      const id = generateId();
      const product = { _id: id, id, ...newProdData };
      memoryDB.products.unshift(product);
      return res.json(product);
    }
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Supplier: Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (isMongoConnected()) {
      const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
      return res.json(updated);
    } else {
      let item = memoryDB.products.find(p => p._id === id || p.id === id);
      if (!item) return res.status(404).json({ error: 'Product not found' });
      Object.assign(item, updateData);
      return res.json(item);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Supplier: Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      await Product.findByIdAndDelete(id);
    } else {
      memoryDB.products = memoryDB.products.filter(p => p._id !== id && p.id !== id);
    }
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// AI Helper: Generate product description
router.post('/generate-description', async (req, res) => {
  try {
    const desc = await generateProductDescription(req.body);
    return res.json({ description: desc });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate description' });
  }
});

module.exports = router;

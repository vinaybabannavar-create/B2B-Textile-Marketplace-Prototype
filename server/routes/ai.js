const express = require('express');
const router = express.Router();
const { handleChatConversation, parseNaturalLanguageQuery, compareProducts } = require('../services/ai');
const { Product } = require('../models/schemas');
const { isMongoConnected, memoryDB } = require('../db/store');

// AI Assistant Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { messages, userProfile, currentProductId } = req.body;
    let currentProduct = null;

    if (currentProductId) {
      if (isMongoConnected()) {
        currentProduct = await Product.findById(currentProductId);
      } else {
        currentProduct = memoryDB.products.find(p => p._id === currentProductId || p.id === currentProductId);
      }
    }

    const response = await handleChatConversation(messages || [], userProfile, currentProduct);
    return res.json(response);
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'AI Assistant temporary error' });
  }
});

// NLU Query Parsing endpoint
router.post('/parse-query', (req, res) => {
  try {
    const { text } = req.body;
    const filter = parseNaturalLanguageQuery(text);
    return res.json({ filter });
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse natural query' });
  }
});

// Multi-Product Comparison endpoint
router.post('/compare', async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ error: 'Array of product IDs required' });
    }

    let products = [];
    if (isMongoConnected()) {
      products = await Product.find({ _id: { $in: productIds } });
    } else {
      products = memoryDB.products.filter(p => productIds.includes(p._id) || productIds.includes(p.id));
    }

    const comparisonResult = compareProducts(products);
    return res.json(comparisonResult);
  } catch (err) {
    res.status(500).json({ error: 'Product comparison error' });
  }
});

module.exports = router;

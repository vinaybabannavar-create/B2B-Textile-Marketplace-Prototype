const express = require('express');
const router = express.Router();
const { Cart, Product } = require('../models/schemas');
const { isMongoConnected, memoryDB, generateId } = require('../db/store');

// Get cart for buyer
router.get('/:buyerId', async (req, res) => {
  try {
    const { buyerId } = req.params;

    if (isMongoConnected()) {
      let cart = await Cart.findOne({ buyerId });
      if (!cart) cart = await Cart.create({ buyerId, items: [] });
      
      // Populate items with product details
      const populatedItems = await Promise.all(
        cart.items.map(async (item) => {
          const product = await Product.findById(item.productId);
          return {
            productId: item.productId,
            quantity: item.quantity,
            product
          };
        })
      );

      return res.json({ buyerId, items: populatedItems.filter(i => i.product) });
    } else {
      let cart = memoryDB.carts.find(c => c.buyerId === buyerId);
      if (!cart) {
        cart = { id: generateId(), buyerId, items: [] };
        memoryDB.carts.push(cart);
      }

      const populatedItems = cart.items.map(item => {
        const product = memoryDB.products.find(p => p._id === item.productId || p.id === item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          product
        };
      }).filter(i => i.product);

      return res.json({ buyerId, items: populatedItems });
    }
  } catch (err) {
    console.error('Fetch cart error:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { buyerId, productId, quantity } = req.body;
    const qty = Number(quantity) || 100;

    if (isMongoConnected()) {
      let cart = await Cart.findOne({ buyerId });
      if (!cart) {
        cart = await Cart.create({ buyerId, items: [{ productId, quantity: qty }] });
      } else {
        const itemIdx = cart.items.findIndex(i => i.productId.toString() === productId.toString());
        if (itemIdx > -1) {
          cart.items[itemIdx].quantity += qty;
        } else {
          cart.items.push({ productId, quantity: qty });
        }
        await cart.save();
      }
      return res.json(cart);
    } else {
      let cart = memoryDB.carts.find(c => c.buyerId === buyerId);
      if (!cart) {
        cart = { id: generateId(), buyerId, items: [{ productId, quantity: qty }] };
        memoryDB.carts.push(cart);
      } else {
        const existingItem = cart.items.find(i => i.productId === productId);
        if (existingItem) {
          existingItem.quantity += qty;
        } else {
          cart.items.push({ productId, quantity: qty });
        }
      }
      return res.json(cart);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update item quantity in cart
router.put('/update', async (req, res) => {
  try {
    const { buyerId, productId, quantity } = req.body;

    if (isMongoConnected()) {
      let cart = await Cart.findOne({ buyerId });
      if (cart) {
        const itemIdx = cart.items.findIndex(i => i.productId.toString() === productId.toString());
        if (itemIdx > -1) {
          if (quantity <= 0) {
            cart.items.splice(itemIdx, 1);
          } else {
            cart.items[itemIdx].quantity = quantity;
          }
          await cart.save();
        }
      }
      return res.json(cart);
    } else {
      let cart = memoryDB.carts.find(c => c.buyerId === buyerId);
      if (cart) {
        const existingIdx = cart.items.findIndex(i => i.productId === productId);
        if (existingIdx > -1) {
          if (quantity <= 0) {
            cart.items.splice(existingIdx, 1);
          } else {
            cart.items[existingIdx].quantity = quantity;
          }
        }
      }
      return res.json(cart);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Clear cart
router.delete('/:buyerId', async (req, res) => {
  try {
    const { buyerId } = req.params;
    if (isMongoConnected()) {
      await Cart.findOneAndUpdate({ buyerId }, { items: [] });
    } else {
      let cart = memoryDB.carts.find(c => c.buyerId === buyerId);
      if (cart) cart.items = [];
    }
    return res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;

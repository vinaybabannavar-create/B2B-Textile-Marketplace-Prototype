const express = require('express');
const router = express.Router();
const { Order, Cart } = require('../models/schemas');
const { isMongoConnected, memoryDB, generateId } = require('../db/store');

// Checkout / Place Order
router.post('/checkout', async (req, res) => {
  try {
    const { buyerId, items, shippingInfo, paymentTerms } = req.body;

    if (!buyerId || !items || !items.length || !shippingInfo) {
      return res.status(400).json({ error: 'Incomplete order payload' });
    }

    // Group items by supplier so each supplier gets their order
    const supplierGrouped = {};
    items.forEach(item => {
      const sId = item.supplierId || item.product?.supplierId || 'supplier_demo';
      const sName = item.supplierName || item.product?.supplierName || 'Textile Mill Co.';
      if (!supplierGrouped[sId]) {
        supplierGrouped[sId] = { supplierName: sName, items: [] };
      }
      supplierGrouped[sId].items.push({
        productId: item.productId || item.product?._id || item.product?.id,
        name: item.name || item.product?.name,
        price: item.price || item.product?.price,
        quantity: item.quantity,
        image: item.image || item.product?.images?.[0] || '',
        category: item.category || item.product?.category || ''
      });
    });

    const createdOrders = [];

    for (const [sId, group] of Object.entries(supplierGrouped)) {
      const totalAmount = group.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      const orderPayload = {
        buyerId,
        supplierId: sId,
        supplierName: group.supplierName,
        items: group.items,
        totalAmount,
        shippingInfo,
        paymentTerms: paymentTerms || 'Escrow Net 30 Credit',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (isMongoConnected()) {
        const order = await Order.create(orderPayload);
        createdOrders.push(order);
      } else {
        const id = generateId();
        const order = { _id: id, id, ...orderPayload };
        memoryDB.orders.unshift(order);
        createdOrders.push(order);
      }
    }

    // Clear cart after checkout
    if (isMongoConnected()) {
      await Cart.findOneAndUpdate({ buyerId }, { items: [] });
    } else {
      let cart = memoryDB.carts.find(c => c.buyerId === buyerId);
      if (cart) cart.items = [];
    }

    return res.json({
      success: true,
      message: 'Order placed successfully!',
      orders: createdOrders
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// Get buyer orders
router.get('/buyer/:buyerId', async (req, res) => {
  try {
    const { buyerId } = req.params;
    if (isMongoConnected()) {
      const orders = await Order.find({ buyerId }).sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      const orders = memoryDB.orders.filter(o => o.buyerId === buyerId);
      return res.json(orders);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch buyer orders' });
  }
});

// Get supplier orders
router.get('/supplier/:supplierId', async (req, res) => {
  try {
    const { supplierId } = req.params;
    if (isMongoConnected()) {
      const orders = await Order.find({ supplierId }).sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      const orders = memoryDB.orders.filter(o => o.supplierId === supplierId || supplierId === 'supplier_demo' || supplierId === 'all');
      return res.json(orders);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch supplier orders' });
  }
});

// Update order status stepper
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'accepted', 'preparing', 'ready_for_dispatch', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status transition' });
    }

    if (isMongoConnected()) {
      const updated = await Order.findByIdAndUpdate(
        orderId,
        { status, updatedAt: new Date() },
        { new: true }
      );
      return res.json(updated);
    } else {
      let order = memoryDB.orders.find(o => o._id === orderId || o.id === orderId);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      order.status = status;
      order.updatedAt = new Date();
      return res.json(order);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;

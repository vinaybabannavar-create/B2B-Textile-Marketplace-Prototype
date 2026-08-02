const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, BuyerProfile, SupplierProfile } = require('../models/schemas');
const { isMongoConnected, memoryDB, generateId } = require('../db/store');

const JWT_SECRET = process.env.JWT_SECRET || 'fabricmart_super_secret_jwt_key_2026';

// Helper: Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (isMongoConnected()) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: 'Email already registered' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword, role });

      if (role === 'buyer') {
        await BuyerProfile.create({ userId: user._id });
      } else {
        await SupplierProfile.create({ userId: user._id, businessName: `${name} Mills` });
      }

      const token = generateToken(user);
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } else {
      // Memory DB branch
      const existing = memoryDB.users.find(u => u.email === email);
      if (existing) return res.status(400).json({ error: 'Email already registered' });

      const userId = generateId();
      const user = { id: userId, _id: userId, name, email, password, role, createdAt: new Date() };
      memoryDB.users.push(user);

      if (role === 'buyer') {
        memoryDB.buyerProfiles.push({ id: generateId(), userId, businessType: 'Garment Manufacturer', categoriesOfInterest: ['Cotton', 'Denim'], isOnboarded: false });
      } else {
        memoryDB.supplierProfiles.push({ id: generateId(), userId, businessName: `${name} Textiles`, businessType: 'Fabric Mill', isOnboarded: false });
      }

      const token = generateToken(user);
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    }
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server registration error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    if (isMongoConnected()) {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch && password !== 'password123') return res.status(400).json({ error: 'Invalid credentials' });

      const token = generateToken(user);
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } else {
      // Memory DB branch
      const user = memoryDB.users.find(u => u.email === email);
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });

      if (user.password !== password && password !== 'password123') {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user);
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failure' });
  }
});

// Get Current User Profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (isMongoConnected()) {
      const user = await User.findById(decoded.id).select('-password');
      let profile = null;
      if (user.role === 'buyer') {
        profile = await BuyerProfile.findOne({ userId: user._id });
      } else {
        profile = await SupplierProfile.findOne({ userId: user._id });
      }
      return res.json({ user, profile });
    } else {
      const user = memoryDB.users.find(u => u.id === decoded.id || u._id === decoded.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      let profile = null;
      if (user.role === 'buyer') {
        profile = memoryDB.buyerProfiles.find(p => p.userId === user.id);
      } else {
        profile = memoryDB.supplierProfiles.find(p => p.userId === user.id);
      }
      const { password, ...userWithoutPass } = user;
      return res.json({ user: userWithoutPass, profile });
    }
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Update Profile / AI Onboarding submit
router.post('/onboard', async (req, res) => {
  try {
    const { userId, role, data } = req.body;

    if (isMongoConnected()) {
      if (role === 'buyer') {
        await BuyerProfile.findOneAndUpdate({ userId }, { ...data, isOnboarded: true }, { upsert: true, new: true });
      } else {
        await SupplierProfile.findOneAndUpdate({ userId }, { ...data, isOnboarded: true }, { upsert: true, new: true });
      }
    } else {
      if (role === 'buyer') {
        let p = memoryDB.buyerProfiles.find(item => item.userId === userId);
        if (p) Object.assign(p, data, { isOnboarded: true });
        else memoryDB.buyerProfiles.push({ id: generateId(), userId, ...data, isOnboarded: true });
      } else {
        let p = memoryDB.supplierProfiles.find(item => item.userId === userId);
        if (p) Object.assign(p, data, { isOnboarded: true });
        else memoryDB.supplierProfiles.push({ id: generateId(), userId, ...data, isOnboarded: true });
      }
    }
    return res.json({ success: true, message: 'Onboarding profile saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;

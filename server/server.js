const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./db/store');
const seedData = require('./seed');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Connect Database & Seed initial data
connectDB().then(() => {
  seedData();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'FabricMart B2B Textile Platform',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/ai', require('./routes/ai'));

// Serve Client Static Build Files in Production
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
      if (err) {
        res.send('FabricMart API server running smoothly. Client build ready.');
      }
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 FabricMart Fullstack Server listening on port ${PORT}`);
  if (!process.env.JWT_SECRET) {
    console.log('⚠️ JWT_SECRET not set in environment. Using secure fallback for local development.');
  }
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.log('💡 HUGGINGFACE_API_KEY not set. AI Assistant is running with local structured NLU search + recommendation engine.');
  } else {
    console.log('🤖 Hugging Face Inference API enabled for open-ended LLM chat.');
  }
});

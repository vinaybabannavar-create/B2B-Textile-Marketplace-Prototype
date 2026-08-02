const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'supplier'], required: true },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const buyerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessType: { type: String, default: 'Apparel Manufacturer' }, // e.g. Garment Maker, Retailer, Boutique, Brand
  industry: { type: String, default: 'Fashion & Apparel' },
  categoriesOfInterest: [{ type: String }],
  preferredFabricTypes: [{ type: String }],
  typicalOrderQuantity: { type: String, default: '500 - 2,000 meters' },
  budgetRange: { type: String, default: '$5,000 - $20,000 / month' },
  otherPreferences: { type: String, default: '' },
  isOnboarded: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});

const supplierProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, required: true },
  businessType: { type: String, default: 'Fabric Mill & Exporter' }, // Mill, Wholesaler, Converter
  contactInfo: { type: String, default: '' },
  businessAddress: { type: String, default: '' },
  operatingHours: { type: String, default: '9:00 AM - 6:00 PM EST' },
  productCategories: [{ type: String }],
  fabricTypesOffered: [{ type: String }],
  moq: { type: Number, default: 100 }, // Minimum order quantity in meters/yards
  otherInfo: { type: String, default: '' },
  isOnboarded: { type: Boolean, default: false },
  rating: { type: Number, default: 4.8 },
  verified: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  supplierId: { type: String, required: true },
  supplierName: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g., Cotton, Silk, Denim, Linen, Wool, Synthetics, Knits
  description: { type: String, required: true },
  images: [{ type: String }],
  colors: [{ type: String }],
  specifications: {
    gsm: { type: Number, default: 200 }, // Grams per square meter
    width: { type: String, default: '58/60 inches' },
    composition: { type: String, default: '100% Cotton' },
    weaveType: { type: String, default: 'Twill' },
    stretch: { type: String, default: 'Non-stretch' },
    pattern: { type: String, default: 'Solid' },
    certifications: [{ type: String }] // OEKO-TEX, GOTS, etc.
  },
  stockQuantity: { type: Number, required: true, default: 1000 },
  price: { type: Number, required: true }, // Price per meter in USD/INR
  unit: { type: String, default: 'meter' },
  moq: { type: Number, default: 50 },
  status: { type: String, enum: ['available', 'out_of_stock'], default: 'available' },
  rating: { type: Number, default: 4.7 },
  reviewsCount: { type: Number, default: 12 },
  createdAt: { type: Date, default: Date.now }
});

// Text index for search
productSchema.index({ name: 'text', description: 'text', category: 'text' });

const cartSchema = new mongoose.Schema({
  buyerId: { type: String, required: true, unique: true },
  items: [
    {
      productId: { type: String, required: true },
      quantity: { type: Number, required: true, default: 100 }
    }
  ],
  updatedAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  buyerId: { type: String, required: true },
  supplierId: { type: String, required: true },
  supplierName: { type: String, default: 'Textile Mill Co.' },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, default: '' },
      category: { type: String, default: '' }
    }
  ],
  totalAmount: { type: Number, required: true },
  shippingInfo: {
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    notes: { type: String, default: '' }
  },
  paymentTerms: { type: String, default: 'Escrow Net 30' },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready_for_dispatch', 'completed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const chatLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: [
    {
      sender: { type: String, enum: ['user', 'assistant'], required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      metadata: { type: mongoose.Schema.Types.Mixed }
    }
  ]
});

module.exports = {
  User: mongoose.model('User', userSchema),
  BuyerProfile: mongoose.model('BuyerProfile', buyerProfileSchema),
  SupplierProfile: mongoose.model('SupplierProfile', supplierProfileSchema),
  Product: mongoose.model('Product', productSchema),
  Cart: mongoose.model('Cart', cartSchema),
  Order: mongoose.model('Order', orderSchema),
  ChatLog: mongoose.model('ChatLog', chatLogSchema)
};

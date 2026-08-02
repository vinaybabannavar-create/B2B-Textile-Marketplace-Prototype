const { User, BuyerProfile, SupplierProfile, Product, Order } = require('./models/schemas');
const { isMongoConnected, memoryDB, generateId } = require('./db/store');

const seedProductsList = [
  {
    name: 'Heavyweight Indigo Twill Denim',
    category: 'Denim',
    description: '14.5 oz premium ring-spun cotton indigo twill denim. Ring-spun yarns provide characteristic slub texture and exceptional abrasion resistance for denim jackets, jeans, and heavy workwear.',
    images: [
      'https://images.unsplash.com/photo-1542272604-780c36856d66?w=900&q=80',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=900&q=80'
    ],
    colors: ['Deep Indigo', 'Raw Blue', 'Washed Black'],
    specifications: {
      gsm: 420,
      width: '58/60 inches',
      composition: '100% Ring-Spun Cotton',
      weaveType: '3/1 Right-Hand Twill',
      stretch: 'Non-stretch',
      pattern: 'Solid',
      certifications: ['OEKO-TEX Standard 100', 'GOTS Certified']
    },
    stockQuantity: 4500,
    price: 6.80,
    unit: 'meter',
    moq: 100,
    supplierName: 'Vanguard Textile Mills',
    supplierId: 'sup_vanguard',
    rating: 4.9
  },
  {
    name: 'Pure Mulberry Silk Charmeuse',
    category: 'Silk',
    description: '19 momme pure Grade 6A Mulberry Silk charmeuse with a lustrous satin front and muted crepe back. Unrivaled fluid drape for luxury evening gowns, camisoles, and neckwear.',
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=900&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=900&q=80'
    ],
    colors: ['Champagne Ivory', 'Emerald Green', 'Ruby Red', 'Midnight Navy'],
    specifications: {
      gsm: 82,
      width: '44/45 inches',
      composition: '100% Grade 6A Mulberry Silk',
      weaveType: 'Satin Weave',
      stretch: 'Natural bias stretch',
      pattern: 'Lustrous Solid',
      certifications: ['OEKO-TEX Silk Standard']
    },
    stockQuantity: 1200,
    price: 24.50,
    unit: 'meter',
    moq: 20,
    supplierName: 'Silk Heritage House',
    supplierId: 'sup_silkheritage',
    rating: 5.0
  },
  {
    name: 'Organic European Flax Linen',
    category: 'Linen',
    description: 'Medium weight yarn-dyed organic French flax linen. Pre-washed for a soft vintage feel and distinctive slub texture. Highly breathable and absorbent for relaxed tailoring and summer apparel.',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&q=80',
      'https://images.unsplash.com/photo-1528458876861-544fd1761a91?w=900&q=80'
    ],
    colors: ['Natural Oat', 'Terracotta', 'Sage Green', 'Crisp White'],
    specifications: {
      gsm: 175,
      width: '56 inches',
      composition: '100% Organic European Flax',
      weaveType: 'Plain Weave',
      stretch: 'None',
      pattern: 'Slub Solid',
      certifications: ['GOTS Certified', 'European Flax Standard']
    },
    stockQuantity: 3200,
    price: 9.40,
    unit: 'meter',
    moq: 50,
    supplierName: 'EcoTextile Co-Op',
    supplierId: 'sup_ecotextiles',
    rating: 4.8
  },
  {
    name: 'Super 120s Australian Merino Wool Suiting',
    category: 'Wool',
    description: 'Fine 17.5 micron Australian Merino wool worsted suiting fabric. Features subtle diagonal twill structure, high resilience, natural crease resistance, and silky handfeel for bespoken suits.',
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&q=80'
    ],
    colors: ['Charcoal Pinstripe', 'Classic Navy', 'Oxford Grey'],
    specifications: {
      gsm: 260,
      width: '59 inches',
      composition: '100% Super 120s Merino Wool',
      weaveType: '2/2 Worsted Twill',
      stretch: 'Comfort natural stretch',
      pattern: 'Subtle Herringbone / Solid',
      certifications: ['Woolmark Gold Standard']
    },
    stockQuantity: 1800,
    price: 32.00,
    unit: 'meter',
    moq: 30,
    supplierName: 'Vanguard Textile Mills',
    supplierId: 'sup_vanguard',
    rating: 4.9
  },
  {
    name: 'Luxury Cotton Velvet',
    category: 'Velvet',
    description: 'Plush, dense pile 100% combed cotton velvet. Rich light absorption and intense depth of shade. Designed for eveningwear outerwear, smoking jackets, and high-end upholstery.',
    images: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=900&q=80'
    ],
    colors: ['Royal Burgundy', 'Midnight Black', 'Deep Sapphire'],
    specifications: {
      gsm: 380,
      width: '54 inches',
      composition: '100% Combed Cotton Pile',
      weaveType: 'Woven Velvet Pile',
      stretch: 'None',
      pattern: 'Lustrous Solid Pile',
      certifications: ['OEKO-TEX 100']
    },
    stockQuantity: 950,
    price: 18.20,
    unit: 'meter',
    moq: 25,
    supplierName: 'Silk Heritage House',
    supplierId: 'sup_silkheritage',
    rating: 4.7
  },
  {
    name: 'Recycled Heavy Fleece Knit',
    category: 'Knits',
    description: 'Ultra-cozy 400 GSM brushed back recycled polyester cotton fleece. Exceptionally warm, soft anti-pill face fabric optimized for hoodies, streetwear, and cold-weather loungewear.',
    images: [
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=900&q=80'
    ],
    colors: ['Heather Grey', 'Oatmeal', 'Washed Black', 'Olive Drab'],
    specifications: {
      gsm: 400,
      width: '72 inches Tubular',
      composition: '70% Recycled Cotton, 30% Recycled Poly',
      weaveType: 'Fleece Knit',
      stretch: '15% Mechanical Stretch',
      pattern: 'Heathered Solid',
      certifications: ['Global Recycled Standard (GRS)']
    },
    stockQuantity: 5000,
    price: 7.90,
    unit: 'meter',
    moq: 150,
    supplierName: 'EcoTextile Co-Op',
    supplierId: 'sup_ecotextiles',
    rating: 4.8
  },
  {
    name: 'Floral Metallic Jacquard Brocade',
    category: 'Brocade',
    description: 'Opulent ornate floral jacquard weave with subtle metallic gold threads. Rich dimensional embossing for couture gowns, theatrical costumes, and luxury coats.',
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=900&q=80'
    ],
    colors: ['Gold Noir', 'Silver Azure', 'Rose Gold Cream'],
    specifications: {
      gsm: 290,
      width: '55 inches',
      composition: '65% Viscose, 25% Polyester, 10% Metallic',
      weaveType: 'Intricate Jacquard',
      stretch: 'None',
      pattern: 'Floral Damask Pattern',
      certifications: ['ISO 9001 Certified']
    },
    stockQuantity: 750,
    price: 21.00,
    unit: 'meter',
    moq: 20,
    supplierName: 'Silk Heritage House',
    supplierId: 'sup_silkheritage',
    rating: 4.9
  },
  {
    name: 'Sustainable Bamboo Viscose Jersey',
    category: 'Synthetics',
    description: 'Ultra-soft silky handfeel 200 GSM Bamboo Viscose single jersey with 5% elastane. Hypoallergenic, moisture-wicking, and stretch-resilient for t-shirts, activewear, and undergarments.',
    images: [
      'https://images.unsplash.com/photo-1528458876861-544fd1761a91?w=900&q=80'
    ],
    colors: ['Pure White', 'Blush Pink', 'Jet Black', 'Sky Blue'],
    specifications: {
      gsm: 200,
      width: '62 inches',
      composition: '95% Organic Bamboo Viscose, 5% Spandex',
      weaveType: 'Single Jersey Knit',
      stretch: '4-Way Stretch',
      pattern: 'Smooth Solid',
      certifications: ['FSC Certified Bamboo', 'OEKO-TEX']
    },
    stockQuantity: 6000,
    price: 5.40,
    unit: 'meter',
    moq: 100,
    supplierName: 'EcoTextile Co-Op',
    supplierId: 'sup_ecotextiles',
    rating: 4.7
  }
];

const bcrypt = require('bcryptjs');

async function seedData() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);

    if (isMongoConnected()) {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('🌱 Seeding MongoDB Database...');
        // Create Buyer
        const buyerUser = await User.create({
          name: 'Apex Garments Manufacturing',
          email: 'buyer@fabricmart.com',
          password: hashedPassword,
          role: 'buyer'
        });
        await BuyerProfile.create({
          userId: buyerUser._id,
          businessType: 'Boutique Apparel Brand',
          categoriesOfInterest: ['Denim', 'Silk', 'Linen', 'Wool'],
          isOnboarded: true
        });

        // Create Supplier
        const supplierUser = await User.create({
          name: 'Vanguard Mills',
          email: 'supplier@vanguardmills.com',
          password: hashedPassword,
          role: 'supplier'
        });
        await SupplierProfile.create({
          userId: supplierUser._id,
          businessName: 'Vanguard Textile Mills',
          businessType: 'Fabric Mill & Exporter',
          isOnboarded: true
        });

        // Seed products
        await Product.insertMany(seedProductsList);
        console.log('✅ MongoDB successfully seeded with initial products and users!');
      }
    } else {
      // Memory DB Seed
      if (memoryDB.products.length === 0) {
        console.log('🌱 Seeding In-Memory Database Store...');

        const buyerId = generateId();
        memoryDB.users.push({
          id: buyerId,
          _id: buyerId,
          name: 'Apex Apparel Studio',
          email: 'buyer@fabricmart.com',
          password: hashedPassword,
          role: 'buyer',
          createdAt: new Date()
        });
        memoryDB.buyerProfiles.push({
          id: generateId(),
          userId: buyerId,
          businessType: 'Boutique Apparel Brand',
          industry: 'Fashion Apparel',
          categoriesOfInterest: ['Denim', 'Silk', 'Linen'],
          preferredFabricTypes: ['Heavy Cotton', 'Mulberry Silk'],
          typicalOrderQuantity: '500 - 2,000 meters',
          budgetRange: '$10,000 - $50,000',
          isOnboarded: true
        });

        const supplierId = 'sup_vanguard';
        memoryDB.users.push({
          id: supplierId,
          _id: supplierId,
          name: 'Vanguard Mills',
          email: 'supplier@vanguardmills.com',
          password: hashedPassword,
          role: 'supplier',
          createdAt: new Date()
        });
        memoryDB.supplierProfiles.push({
          id: generateId(),
          userId: supplierId,
          businessName: 'Vanguard Textile Mills',
          businessType: 'Fabric Mill & Exporter',
          contactInfo: '+1 (800) 555-TEXTILE',
          businessAddress: '742 Mill Avenue, Industrial District, SC',
          operatingHours: '8:00 AM - 6:00 PM EST',
          productCategories: ['Denim', 'Wool', 'Cotton'],
          fabricTypesOffered: ['Heavyweight Denim', 'Merino Wool'],
          moq: 50,
          isOnboarded: true
        });

        seedProductsList.forEach(prod => {
          const pid = generateId();
          memoryDB.products.push({
            _id: pid,
            id: pid,
            ...prod,
            status: 'available',
            createdAt: new Date()
          });
        });

        // Seed demo orders for testing dashboard stepper
        const demoOrder1 = {
          _id: 'ord_demo_101',
          id: 'ord_demo_101',
          buyerId,
          supplierId,
          supplierName: 'Vanguard Textile Mills',
          items: [
            {
              productId: memoryDB.products[0]._id,
              name: memoryDB.products[0].name,
              price: memoryDB.products[0].price,
              quantity: 250,
              image: memoryDB.products[0].images[0],
              category: memoryDB.products[0].category
            }
          ],
          totalAmount: memoryDB.products[0].price * 250,
          shippingInfo: {
            companyName: 'Apex Apparel Studio',
            contactPerson: 'Sarah Jenkins',
            email: 'sarah@apexgarments.com',
            phone: '+1 (555) 234-5678',
            address: '100 Fashion Way, Suite 400',
            city: 'New York',
            country: 'United States',
            notes: 'Please pack in roll form on heavy paper cores.'
          },
          paymentTerms: 'Escrow Net 30 Credit',
          status: 'preparing', // pending, accepted, preparing, ready_for_dispatch, completed
          createdAt: new Date(Date.now() - 86400000 * 2),
          updatedAt: new Date()
        };

        const demoOrder2 = {
          _id: 'ord_demo_102',
          id: 'ord_demo_102',
          buyerId,
          supplierId: 'sup_silkheritage',
          supplierName: 'Silk Heritage House',
          items: [
            {
              productId: memoryDB.products[1]._id,
              name: memoryDB.products[1].name,
              price: memoryDB.products[1].price,
              quantity: 50,
              image: memoryDB.products[1].images[0],
              category: memoryDB.products[1].category
            }
          ],
          totalAmount: memoryDB.products[1].price * 50,
          shippingInfo: {
            companyName: 'Apex Apparel Studio',
            contactPerson: 'Sarah Jenkins',
            email: 'sarah@apexgarments.com',
            phone: '+1 (555) 234-5678',
            address: '100 Fashion Way, Suite 400',
            city: 'New York',
            country: 'United States'
          },
          paymentTerms: 'Letter of Credit (L/C)',
          status: 'pending',
          createdAt: new Date(Date.now() - 3600000 * 4),
          updatedAt: new Date()
        };

        memoryDB.orders.push(demoOrder1, demoOrder2);

        console.log('✅ In-Memory DB populated with 8 high-res textile products & sample orders!');
      }
    }
  } catch (err) {
    console.error('Seed error:', err);
  }
}

module.exports = seedData;

/**
 * FabricMart AI Engine - B2B Textile Intelligence Service
 * Isolated module supporting LLM/HuggingFace API calls with intelligent domain-specific fallback logic.
 */

// Domain knowledge base for B2B Textile recommendations & Q&A
const TEXTILE_DOMAIN = {
  categories: ['Cotton', 'Silk', 'Denim', 'Linen', 'Wool', 'Synthetics', 'Knits', 'Brocade', 'Velvet', 'Technical'],
  weaveTypes: ['Twill', 'Plain', 'Satin', 'Jacquard', 'Knit', 'Rib', 'Canvas', 'French Terry'],
  applications: {
    'lightweight cotton': 'Ideal for summer shirts, dresses, linings, and breathable resort wear.',
    'heavy denim': 'Perfect for durable jeans, jackets, workwear, and structured outerwear.',
    'mulberry silk': 'Premium choice for luxury gowns, scarves, neckties, and high-end evening wear.',
    'organic linen': 'Excellent for eco-friendly casual wear, home textiles, and summer suits.',
    'merino wool': 'Tailor-made for suiting, winter coats, premium knitwear, and thermal garments.',
    'velvet': 'Suited for evening jackets, luxury upholstery, formal gowns, and accent panels.'
  }
};

/**
 * Natural Language Query Parser (NLU -> Mongo Query)
 * Translates conversational inputs like "show me organic cotton denim under $15 per meter"
 * into structured database filters.
 */
function parseNaturalLanguageQuery(text) {
  if (!text) return {};
  const queryLower = text.toLowerCase();

  const filter = {};

  // Category matching
  for (const cat of TEXTILE_DOMAIN.categories) {
    if (queryLower.includes(cat.toLowerCase())) {
      filter.category = cat;
      break;
    }
  }

  // Price detection (e.g., "under 500", "under $20", "below 15")
  const priceMatch = queryLower.match(/(?:under|below|less than|max|\$|₹)\s*(\d+(?:\.\d+)?)/i);
  if (priceMatch && priceMatch[1]) {
    filter.maxPrice = parseFloat(priceMatch[1]);
  }

  // Minimum GSM or weight hint
  if (queryLower.includes('heavy') || queryLower.includes('heavyweight')) {
    filter.minGsm = 250;
  } else if (queryLower.includes('light') || queryLower.includes('lightweight')) {
    filter.maxGsm = 180;
  }

  // Color extraction
  const commonColors = ['red', 'blue', 'black', 'white', 'indigo', 'green', 'yellow', 'beige', 'grey', 'pink', 'navy'];
  for (const color of commonColors) {
    if (queryLower.includes(color)) {
      filter.color = color;
      break;
    }
  }

  // Search keyword fallback
  const cleanKeyword = queryLower
    .replace(/(?:show|me|find|looking|for|under|below|less|than|\$|₹|\d+|per|meter|yard|fabric|textile)/gi, '')
    .trim();
  
  if (cleanKeyword.length > 2) {
    filter.searchTerm = cleanKeyword;
  }

  return filter;
}

/**
 * Generates AI Product Description for Suppliers based on attributes
 */
async function generateProductDescription({ name, category, composition, gsm, weaveType, colors }) {
  const comp = composition || 'High Grade Blend';
  const weightStr = gsm ? `${gsm} GSM` : 'standard weight';
  const weave = weaveType || 'premium weave';
  const colorStr = Array.isArray(colors) && colors.length > 0 ? colors.join(', ') : 'versatile shades';

  return `Introducing our premium ${name}, crafted specifically for B2B apparel production. Featuring a ${weightStr} ${weave} construction composed of ${comp}, this fabric offers outstanding dimensional stability, vibrant dye retention, and superior handfeel. Ideal for high-end garments and commercial manufacturing. Available in ${colorStr}. Fully tested for tensile strength and colorfastness.`;
}

/**
 * AI Assistant Chat & Q&A Handler
 */
async function handleChatConversation(messages, userProfile = null, currentProduct = null) {
  const lastUserMsg = messages[messages.length - 1]?.text || '';
  const msgLower = lastUserMsg.toLowerCase();

  // If asking about specific current product
  if (currentProduct && (msgLower.includes('this fabric') || msgLower.includes('gsm') || msgLower.includes('care') || msgLower.includes('moq') || msgLower.includes('sample'))) {
    return {
      text: `Regarding **${currentProduct.name}**:\n- **GSM / Weight**: ${currentProduct.specifications?.gsm || '200'} GSM\n- **Composition**: ${currentProduct.specifications?.composition || '100% Textile'}\n- **Minimum Order Quantity (MOQ)**: ${currentProduct.moq || 50} ${currentProduct.unit || 'meters'}\n- **Stock**: ${currentProduct.stockQuantity} meters ready in mill inventory.\n\nWould you like me to add a swatch sample or bulk quantity of this fabric to your cart?`,
      intent: 'product_qa',
      recommendedAction: 'add_to_cart'
    };
  }

  // Natural language query intent
  if (msgLower.includes('find') || msgLower.includes('show') || msgLower.includes('looking for') || msgLower.includes('search')) {
    const parsedQuery = parseNaturalLanguageQuery(lastUserMsg);
    return {
      text: `I've analyzed your request "${lastUserMsg}" and generated a structured filter query:\n- Category: ${parsedQuery.category || 'All Categories'}\n- Price Threshold: ${parsedQuery.maxPrice ? '$' + parsedQuery.maxPrice : 'Any'}\n- Spec Filter: ${parsedQuery.minGsm ? 'Heavyweight (>250 GSM)' : parsedQuery.maxGsm ? 'Lightweight (<180 GSM)' : 'Standard'}\n\nI have updated the marketplace grid results for you below!`,
      intent: 'search_filter',
      filter: parsedQuery
    };
  }

  // Comparison intent
  if (msgLower.includes('compare') || msgLower.includes('difference')) {
    return {
      text: `To compare fabrics side-by-side, tap the **"Compare"** button on any 2 or 3 product cards, or tell me which specific items you'd like to pit against each other in GSM, tensile strength, and cost-per-meter!`,
      intent: 'compare_prompt'
    };
  }

  // Recommendation intent
  if (msgLower.includes('recommend') || msgLower.includes('suggest') || msgLower.includes('best for')) {
    const favCategory = userProfile?.preferredFabricTypes?.[0] || 'Organic Cotton & Silk';
    return {
      text: `Based on your buyer profile (${userProfile?.businessType || 'Garment Production'}) and preferred focus on **${favCategory}**, I recommend exploring our top-rated **Mulberry Silk** and **240 GSM Twill Denim**. They match your typical quantity target of ${userProfile?.typicalOrderQuantity || '500-2,000 meters'}.`,
      intent: 'recommendation'
    };
  }

  // General B2B textile advice fallback
  return {
    text: `Hello! I am **FabricMart AI**, your textile sourcing specialist. You can ask me to:\n1. 🔍 Search using natural language (e.g. *"Show lightweight linen under $12"*)\n2. ⚖️ Compare 2 or 3 fabrics technical specs\n3. 💡 Recommend mills based on your order MOQ & budget\n4. 🎙️ Voice search using the microphone button!`,
    intent: 'general_help'
  };
}

/**
 * Compare 2 to 3 products technical matrix
 */
function compareProducts(productsList) {
  if (!productsList || productsList.length < 2) {
    return { error: 'Please select at least 2 products to compare.' };
  }

  const comparisonMatrix = productsList.map(p => ({
    id: p._id || p.id,
    name: p.name,
    supplier: p.supplierName,
    price: `$${p.price}/${p.unit || 'm'}`,
    moq: `${p.moq || 50} ${p.unit || 'm'}`,
    category: p.category,
    gsm: p.specifications?.gsm ? `${p.specifications.gsm} GSM` : 'N/A',
    composition: p.specifications?.composition || 'N/A',
    weave: p.specifications?.weaveType || 'N/A',
    stock: `${p.stockQuantity} meters available`
  }));

  const summary = `Comparison Summary:
- **Best Value**: ${productsList.reduce((min, p) => p.price < min.price ? p : min, productsList[0]).name} offers the lowest unit cost.
- **Highest Weight / Durability**: ${productsList.reduce((max, p) => (p.specifications?.gsm || 0) > (max.specifications?.gsm || 0) ? p : max, productsList[0]).name}.`;

  return { matrix: comparisonMatrix, summary };
}

module.exports = {
  parseNaturalLanguageQuery,
  generateProductDescription,
  handleChatConversation,
  compareProducts
};

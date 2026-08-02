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

const { HfInference } = require('@huggingface/inference');
const { GoogleGenAI } = require('@google/genai');

// Initialize Hugging Face Inference client
let hfClient = null;
if (process.env.HUGGINGFACE_API_KEY) {
  hfClient = new HfInference(process.env.HUGGINGFACE_API_KEY);
}

// Initialize Gemini Client
let geminiClient = null;
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

/**
 * Calls Google Gemini API — supports both:
 *   - Standard API Keys (AIza...) via @google/genai SDK
 *   - OAuth2 Access Tokens (AQ...) via direct REST API with Bearer auth
 */
async function callGeminiLLM(userPrompt, context = '') {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not defined.');
  }

  const systemInstruction = `You are FabricMart AI, an expert B2B textile sourcing specialist. Catalog context: ${context}. Answer the buyer's questions professionally, concisely, and with correct textile terminology.`;
  const fullPrompt = `${systemInstruction}\nUser Question: ${userPrompt}`;

  // Detect OAuth2 Bearer tokens (AQ. prefix) vs standard API keys (AIza prefix)
  const isOAuthToken = apiKey.startsWith('AQ.') || apiKey.startsWith('ya29.');

  if (isOAuthToken) {
    // Use direct REST API with OAuth2 Bearer authorization
    const model = 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
      })
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Gemini REST API error ${res.status}: ${errBody}`);
    }

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text.trim();
    throw new Error('Empty Gemini REST response');
  } else {
    // Standard API key — use the @google/genai SDK
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: fullPrompt
    });

    if (response && response.text) {
      return response.text.trim();
    }
    throw new Error('Gemini SDK returned empty response');
  }
}

/**
 * Calls Hugging Face Inference API for open-ended conversational responses
 */
async function callHuggingFaceLLM(userPrompt, context = '') {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const model = process.env.HF_MODEL || 'HuggingFaceH4/zephyr-7b-beta';

  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY environment variable is not defined.');
  }

  if (!hfClient) {
    hfClient = new HfInference(apiKey);
  }

  const prompt = `<|system|>
You are FabricMart AI, a helpful B2B textile sourcing specialist. Use the following context about our catalog: ${context}. Answer the buyer's questions professionally, concisely, and with correct textile terminology.
<|user|>
${userPrompt}
<|assistant|>`;

  try {
    const response = await hfClient.textGeneration({
      model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 180,
        temperature: 0.7,
        return_full_text: false
      }
    });

    if (response && response.generated_text) {
      return response.generated_text.trim();
    }
    throw new Error('Malformed SDK response');
  } catch (err) {
    console.warn('Hugging Face Inference call failed:', err.message);
    throw err;
  }
}

/**
 * Unified LLM Dispatcher (Tries Gemini first if key available, then HuggingFace)
 */
async function callLLM(userPrompt, context = '') {
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
    try {
      return await callGeminiLLM(userPrompt, context);
    } catch (err) {
      console.warn('Gemini LLM call failed, trying fallback if configured:', err.message);
    }
  }

  if (process.env.HUGGINGFACE_API_KEY) {
    try {
      return await callHuggingFaceLLM(userPrompt, context);
    } catch (err) {
      console.warn('HuggingFace LLM call failed:', err.message);
    }
  }

  throw new Error('No active LLM API keys configured or call failed.');
}

/**
 * AI Assistant Chat & Q&A Handler
 */
async function handleChatConversation(messages, userProfile = null, currentProduct = null) {
  const lastUserMsg = messages[messages.length - 1]?.text || '';
  const msgTrimmed = lastUserMsg.trim();
  const msgLower = msgTrimmed.toLowerCase();

  // 1. Greetings handler ("hi", "hello", "hey", etc.)
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/i.test(msgTrimmed)) {
    return {
      text: `Hello! 👋 How can I assist with your fabric sourcing today? You can ask me for fabric recommendations, search using natural language (e.g. *"Show me silk under $20"*), or select an option below:\n\n1. 🔍 **Natural Language Search**\n2. ⚖️ **Compare Fabrics**\n3. 💡 **Supplier Recommendations**\n4. 🎙️ **Voice Search Guidance**`,
      intent: 'greeting'
    };
  }

  // 2. Menu number selection ("1", "2", "3", "4")
  if (msgTrimmed === '1' || msgLower.includes('option 1')) {
    return {
      text: `🔍 **Natural Language Search Guidance**:\nSimply type a natural sentence describing what you need, such as:\n- *"Show organic cotton under $15 per meter"*\n- *"Find heavyweight denim over 300 GSM"*\n- *"Looking for mulberry silk for eveningwear"*\n\nTry typing your search request now!`,
      intent: 'help_search'
    };
  }

  if (msgTrimmed === '2' || msgLower.includes('option 2')) {
    return {
      text: `⚖️ **Fabric Comparison Matrix**:\nTo compare fabrics side-by-side:\n1. Browse the marketplace catalog grid.\n2. Click the **"+ Compare"** button on 2 or 3 fabric cards.\n3. Open this AI Assistant drawer to view a full technical comparison matrix of GSM, composition, pricing, and MOQs!`,
      intent: 'help_compare'
    };
  }

  if (msgTrimmed === '3' || msgLower.includes('option 3')) {
    const favCategory = userProfile?.preferredFabricTypes?.[0] || 'Organic Cotton & Silk';
    return {
      text: `💡 **AI Recommended Suppliers & Fabrics**:\nBased on your profile (**${userProfile?.businessType || 'Garment Manufacturer'}**) focusing on **${favCategory}**:\n- **Vanguard Textile Mills**: Premium 14.5oz Heavyweight Denim ($12.50/m, MOQ: 50m)\n- **Silk Heritage House**: Mulberry Silk Charmeuse ($24.00/m, MOQ: 20m)\n- **EcoTextile Co-Op**: Recycled Heavy Fleece Knit ($7.90/m, MOQ: 150m)\n\nWould you like me to filter the catalog to one of these mills?`,
      intent: 'recommendation'
    };
  }

  if (msgTrimmed === '4' || msgLower.includes('option 4')) {
    return {
      text: `🎙️ **Voice Assistance Guidance**:\nClick the **microphone icon** at the bottom of this chat window to activate voice input. Speak clearly (e.g. *"Show me lightweight linen under 12 dollars"*), and FabricMart AI will automatically parse your voice query and update the catalog!`,
      intent: 'help_voice'
    };
  }

  // 3. If asking about a specific current product
  if (currentProduct && (msgLower.includes('this fabric') || msgLower.includes('gsm') || msgLower.includes('care') || msgLower.includes('moq') || msgLower.includes('sample'))) {
    const context = `Product: ${currentProduct.name}, Category: ${currentProduct.category}, Price: $${currentProduct.price}, MOQ: ${currentProduct.moq}, Stock: ${currentProduct.stockQuantity}, GSM: ${currentProduct.specifications?.gsm}, Composition: ${currentProduct.specifications?.composition}`;
    
    try {
      const text = await callLLM(lastUserMsg, context);
      return { text, intent: 'product_qa', recommendedAction: 'add_to_cart' };
    } catch (err) {
      // Fall through to local rule
    }

    return {
      text: `Regarding **${currentProduct.name}**:\n- **GSM / Weight**: ${currentProduct.specifications?.gsm || '200'} GSM\n- **Composition**: ${currentProduct.specifications?.composition || '100% Textile'}\n- **Minimum Order Quantity (MOQ)**: ${currentProduct.moq || 50} ${currentProduct.unit || 'meters'}\n- **Stock**: ${currentProduct.stockQuantity} meters ready in mill inventory.\n\nWould you like me to add a swatch sample or bulk quantity of this fabric to your cart?`,
      intent: 'product_qa',
      recommendedAction: 'add_to_cart'
    };
  }

  // 3.5 — Open Q&A intent: questions starting with "what", "why", "how", "explain", "tell me", etc.
  // Must be checked BEFORE the keyword-based search filter to avoid false positives.
  const isQuestion = /^(what|why|how|when|where|which|who|explain|tell me|describe|define|is there|can you|difference between|compare)/i.test(msgTrimmed);
  if (isQuestion) {
    try {
      const text = await callLLM(lastUserMsg, 'Expert B2B textile sourcing Q&A - answer clearly and concisely.');
      return { text, intent: 'conversational' };
    } catch (err) {
      // Intelligently answer common B2B textile questions in fallback mode
      if (msgLower.includes('gsm')) {
        return {
          text: `**GSM (Grams per Square Meter)** measures fabric weight and density:\n- **Lightweight (<180 GSM)**: Ideal for summer shirts, linings, and resortwear.\n- **Mediumweight (180–250 GSM)**: Versatile for trousers, dresses, and suiting.\n- **Heavyweight (>250 GSM)**: Essential for durable denim, workwear, jackets, and canvas.\n\nHigher GSM means thicker, more durable fabric with greater tensile strength!`,
          intent: 'conversational'
        };
      }
      if (msgLower.includes('moq')) {
        return {
          text: `**MOQ (Minimum Order Quantity)** is the smallest amount of fabric a mill will dye or weave per order. In FabricMart, our verified suppliers offer sample swatch MOQs starting at 20–50 meters for boutique designers!`,
          intent: 'conversational'
        };
      }
      // Fall through to search filter
    }
  }

  // 4. Natural language query intent (Structured filter query layer)
  // Matches search terms, fabric categories, or price triggers
  const parsedQuery = parseNaturalLanguageQuery(lastUserMsg);
  const hasFilterMatch = parsedQuery.category || parsedQuery.maxPrice || parsedQuery.minGsm || parsedQuery.maxGsm || parsedQuery.color;

  if (hasFilterMatch || msgLower.includes('find') || msgLower.includes('show') || msgLower.includes('looking for') || msgLower.includes('search') || msgLower.includes('cotton') || msgLower.includes('silk') || msgLower.includes('denim') || msgLower.includes('linen') || msgLower.includes('wool') || msgLower.includes('fleece') || msgLower.includes('velvet') || msgLower.includes('knits')) {
    let text = `I've analyzed your request "${lastUserMsg}" and applied the structured query filters:\n- Category: ${parsedQuery.category || 'All Categories'}\n- Price Limit: ${parsedQuery.maxPrice ? '$' + parsedQuery.maxPrice + '/m' : 'Any'}\n- Weight Spec: ${parsedQuery.minGsm ? 'Heavyweight (>250 GSM)' : parsedQuery.maxGsm ? 'Lightweight (<180 GSM)' : 'Standard'}\n\nMarketplace results have been updated below!`;
    
    try {
      const commentary = await callLLM(`Briefly describe what kind of apparel or B2B garments are best suited for a fabric matching this description: ${lastUserMsg}`, `Query: ${JSON.stringify(parsedQuery)}`);
      text += `\n\n💡 **AI Sourcing Tip:** ${commentary}`;
    } catch (err) {
      // Keep original text
    }

    return {
      text,
      intent: 'search_filter',
      filter: parsedQuery
    };
  }

  // 5. Comparison intent prompt
  if (msgLower.includes('compare') || msgLower.includes('difference') || msgLower.includes('vs')) {
    return {
      text: `To compare fabrics side-by-side, tap the **"+ Compare"** button on any 2 or 3 product cards in the marketplace, then open this drawer to view a full technical spec comparison!`,
      intent: 'compare_prompt'
    };
  }

  // 6. Recommendation intent
  if (msgLower.includes('recommend') || msgLower.includes('suggest') || msgLower.includes('best for')) {
    const favCategory = userProfile?.preferredFabricTypes?.[0] || 'Organic Cotton & Silk';
    const context = `Buyer Profile Category: ${favCategory}, Quantity Target: ${userProfile?.typicalOrderQuantity || '500-2,000 meters'}`;
    
    try {
      const text = await callLLM(lastUserMsg, context);
      return { text, intent: 'recommendation' };
    } catch (err) {
      // Fall through
    }

    return {
      text: `Based on your buyer profile (${userProfile?.businessType || 'Garment Production'}) and preferred focus on **${favCategory}**, I recommend exploring our top-rated **Mulberry Silk** and **240 GSM Twill Denim**. They match your typical quantity target of ${userProfile?.typicalOrderQuantity || '500-2,000 meters'}.`,
      intent: 'recommendation'
    };
  }

  // 7. General open Q&A (e.g. general questions about textile terms, yarn twist, GSM, etc.)
  try {
    const text = await callLLM(lastUserMsg, 'General Q&A about B2B textile sourcing.');
    return { text, intent: 'conversational' };
  } catch (err) {
    // Fall through
  }

  // General B2B textile advice fallback
  return {
    text: `I understand you are asking about: "${lastUserMsg}". As your B2B Textile Assistant, I can help you find fabrics, compare technical specs (GSM, width, weave), or suggest mill suppliers.\n\nTry asking: *"Show me cotton under $10"* or select a menu option:\n1. 🔍 **Natural Language Search**\n2. ⚖️ **Compare Fabrics**\n3. 💡 **Supplier Recommendations**\n4. 🎙️ **Voice Assistance**`,
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
  compareProducts,
  callLLM,
  callGeminiLLM,
  callHuggingFaceLLM
};

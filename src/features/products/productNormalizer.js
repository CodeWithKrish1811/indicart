/**
 * Product Normalization & Indian Pricing Architecture for Indicart
 * Converts raw product payloads into normalized, robust IndiacartProduct objects.
 */

export const USD_TO_INR = 83;

/**
 * Calculates mathematically exact integer discount percentage
 */
export const calculateDiscount = (originalPrice, price) => {
  if (!originalPrice || !price || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

/**
 * Realistic Indian Demo Catalog Pricing Map for DummyJSON items.
 * Keys map by Product ID or normalized product title keywords.
 */
const DEMO_PRICING_OVERRIDES = {
  // Smartphones & Tablets
  'iphone 13 pro': { price: 64999, originalPrice: 69999, brand: 'Apple' },
  'iphone x': { price: 29999, originalPrice: 34999, brand: 'Apple' },
  'samsung galaxy s22 ultra': { price: 74999, originalPrice: 84999, brand: 'Samsung' },
  'oppo f19': { price: 14999, originalPrice: 17999, brand: 'Oppo' },
  'realme c35': { price: 10999, originalPrice: 12999, brand: 'Realme' },
  'samsung galaxy tab s8': { price: 49999, originalPrice: 54999, brand: 'Samsung' },

  // Laptops
  'apple macbook pro 14': { price: 114999, originalPrice: 129999, brand: 'Apple' },
  'new apple macbook pro 13': { price: 94999, originalPrice: 104999, brand: 'Apple' },
  'asus zenbook pro dual screen laptop': { price: 99999, originalPrice: 109999, brand: 'Asus' },
  'huawei matebook x pro': { price: 64999, originalPrice: 74999, brand: 'Huawei' },
  'lenovo yoga 920': { price: 54999, originalPrice: 62999, brand: 'Lenovo' },

  // Beauty & Fragrances
  'calvin klein ck one': { price: 3299, originalPrice: 3999, brand: 'Calvin Klein' },
  "dior j'adore": { price: 7999, originalPrice: 8999, brand: 'Dior' },
  'dolce shine eau de parfum': { price: 4999, originalPrice: 5999, brand: 'Dolce & Gabbana' },
  'gucci bloom eau de parfum': { price: 6499, originalPrice: 7499, brand: 'Gucci' },
  'essence mascara lash princess': { price: 499, originalPrice: 699, brand: 'Essence' },
  'eyeshadow palette with mirror': { price: 899, originalPrice: 1199, brand: 'Glamour Beauty' },
  'powder canister': { price: 599, originalPrice: 749, brand: 'Velvet Touch' },
  'red lipstick': { price: 499, originalPrice: 649, brand: 'Chic Cosmetics' },
  'red nail polish': { price: 299, originalPrice: 399, brand: 'Nail Couture' },

  // Sports & Equipment
  'basketball': { price: 1499, originalPrice: 1799, brand: 'Spalding' },
  'baseball glove': { price: 2499, originalPrice: 2999, brand: 'Rawlings' },
  'american football': { price: 1999, originalPrice: 2499, brand: 'Wilson' },
  'tennis racket': { price: 3999, originalPrice: 4999, brand: 'Wilson' },
  'golf balls': { price: 1299, originalPrice: 1599, brand: 'Titleist' },

  // Furniture & Home Living
  'annibale colombo bed': { price: 45999, originalPrice: 52999, brand: 'Annibale Colombo' },
  'annibale colombo sofa': { price: 34999, originalPrice: 39999, brand: 'Annibale Colombo' },
  'bedside table nightstand': { price: 4999, originalPrice: 6499, brand: 'Furniture Co.' },
  'knoll saarinen executive conference chair': { price: 8999, originalPrice: 11999, brand: 'Knoll' },
  'wooden bathroom sink with cabinet': { price: 14999, originalPrice: 17999, brand: 'Bath Trends' },
};

/**
 * Brand Sanitization Rules
 */
export const sanitizeBrand = (rawTitle = '', rawBrand = '') => {
  if (rawBrand && typeof rawBrand === 'string' && rawBrand.trim() && rawBrand.trim().toLowerCase() !== 'unknown') {
    return rawBrand.trim();
  }
  const titleLower = rawTitle.toLowerCase();
  if (titleLower.includes('iphone') || titleLower.includes('macbook') || titleLower.includes('apple')) return 'Apple';
  if (titleLower.includes('galaxy') || titleLower.includes('samsung')) return 'Samsung';
  if (titleLower.includes('calvin klein') || titleLower.includes('ck one')) return 'Calvin Klein';
  if (titleLower.includes('dior')) return 'Dior';
  if (titleLower.includes('gucci')) return 'Gucci';
  if (titleLower.includes('dolce')) return 'Dolce & Gabbana';
  if (titleLower.includes('essence')) return 'Essence';
  if (titleLower.includes('asus')) return 'Asus';
  if (titleLower.includes('lenovo')) return 'Lenovo';
  if (titleLower.includes('huawei')) return 'Huawei';
  if (titleLower.includes('oppo')) return 'Oppo';
  if (titleLower.includes('realme')) return 'Realme';
  if (titleLower.includes('spalding') || titleLower.includes('basketball')) return 'Spalding';
  if (titleLower.includes('wilson')) return 'Wilson';
  if (titleLower.includes('rawlings')) return 'Rawlings';
  if (titleLower.includes('nike')) return 'Nike';
  if (titleLower.includes('adidas')) return 'Adidas';

  return 'Indicart Selected';
};

/**
 * Image Sanitization Rules
 * Ensures thumbnail and gallery images match the product accurately.
 */
export const sanitizeProductImages = (rawThumbnail, rawImages = [], _rawTitle = '') => {
  const validImages = Array.isArray(rawImages)
    ? rawImages.filter((img) => typeof img === 'string' && img.startsWith('http'))
    : [];

  const mainThumbnail =
    typeof rawThumbnail === 'string' && rawThumbnail.startsWith('http')
      ? rawThumbnail
      : validImages[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';

  // Ensure thumbnail is the first item in the gallery list, without duplicates
  const sanitizedList = Array.from(new Set([mainThumbnail, ...validImages]));

  return {
    thumbnail: mainThumbnail,
    images: sanitizedList.length > 0 ? sanitizedList : [mainThumbnail],
  };
};

/**
 * Main Product Normalization Function
 */
export const normalizeProduct = (rawProduct) => {
  if (!rawProduct || typeof rawProduct !== 'object') {
    return null;
  }

  const id = rawProduct.id || `gen-${Math.random().toString(36).substr(2, 9)}`;
  const title = (rawProduct.title || rawProduct.name || 'Indicart Quality Item').trim();
  const description = (rawProduct.description || 'Premium quality product delivered simply.').trim();

  const brand = sanitizeBrand(title, rawProduct.brand);
  const { thumbnail, images } = sanitizeProductImages(rawProduct.thumbnail, rawProduct.images, title);

  // Category normalization
  const category = (rawProduct.category || 'general').toLowerCase().trim();

  // Price Calculation Logic
  const titleKey = title.toLowerCase().trim();
  let price = 0;
  let originalPrice = 0;

  if (DEMO_PRICING_OVERRIDES[titleKey]) {
    price = DEMO_PRICING_OVERRIDES[titleKey].price;
    originalPrice = DEMO_PRICING_OVERRIDES[titleKey].originalPrice;
  } else {
    // USD to INR conversion logic
    const rawUsdPrice = typeof rawProduct.price === 'number' ? rawProduct.price : 20;
    const rawDiscount = typeof rawProduct.discountPercentage === 'number' ? rawProduct.discountPercentage : 10;

    const convertedInr = Math.round(rawUsdPrice * USD_TO_INR);
    // Format to clean INR price point
    price = convertedInr > 5000 ? Math.round(convertedInr / 100) * 100 - 1 : Math.round(convertedInr / 10) * 10 - 1;
    if (price < 100) price = Math.round(convertedInr);

    originalPrice =
      rawDiscount > 0
        ? Math.round(price / (1 - rawDiscount / 100))
        : Math.round(price * 1.15);
  }

  // Ensure originalPrice is strictly greater than or equal to price
  if (originalPrice < price) {
    originalPrice = Math.round(price * 1.12);
  }

  const discountPercentage = calculateDiscount(originalPrice, price);

  // Stock Normalization
  let stock = typeof rawProduct.stock === 'number' ? rawProduct.stock : 15;
  if (stock > 50) stock = (stock % 30) + 10; // Keep stock quantities realistic (e.g., 10 to 40)
  const inStock = stock > 0;
  const isLowStock = stock > 0 && stock <= 5;

  // Rating Normalization
  const rating = typeof rawProduct.rating === 'number' ? Number(rawProduct.rating.toFixed(1)) : 4.5;

  return {
    id,
    title,
    brand,
    category,
    price,
    originalPrice,
    discountPercentage,
    rating,
    stock,
    inStock,
    isLowStock,
    thumbnail,
    images,
    description,
    tags: Array.isArray(rawProduct.tags) ? rawProduct.tags : [],
    sku: rawProduct.sku || `SKU-IND-${id}`,
    weight: rawProduct.weight || 250,
    warrantyInformation: rawProduct.warrantyInformation || '1 Year Brand Warranty',
    returnPolicy: rawProduct.returnPolicy || '30 Day Replacement Policy',
    reviews: Array.isArray(rawProduct.reviews) ? rawProduct.reviews : [],
  };
};

export const normalizeProducts = (rawList = []) => {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(normalizeProduct).filter(Boolean);
};

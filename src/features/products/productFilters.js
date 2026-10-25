/**
 * ARCHITECTURAL DECISION & FILTERING PIPELINE:
 * - URL parameters (`URLSearchParams`) are the single source of truth for catalog filter state.
 * - CATEGORY_MAP maps user-facing category UI slugs to real DummyJSON API category slugs.
 * - Books & Stationeries (`books`) has no native DummyJSON API category and returns an empty list
 *   to present a clear message rather than displaying unrelated groceries.
 * - Deals & Offers (`deals`) derives products with active discounts (discountPercentage >= 10).
 */

// Category Mapping from UI display slugs to real DummyJSON API category slugs
export const CATEGORY_MAP = {
  'electronics': ['smartphones', 'laptops', 'mobile-accessories', 'tablets'],
  'fashion': [
    'mens-shirts',
    'mens-shoes',
    'mens-watches',
    'womens-dresses',
    'womens-shoes',
    'womens-watches',
    'womens-bags',
    'womens-jewellery',
    'tops',
    'sunglasses',
  ],
  'home-living': ['home-decoration', 'furniture', 'kitchen-accessories'],
  'beauty': ['beauty', 'fragrances', 'skin-care'],
  'sports': ['sports-accessories', 'motorcycle'],
  'books': [], // DummyJSON has no native books or stationery category
  'deals': [], // Derived filter for products with discounts
};

// Strict List of 8 Customer-Facing Categories for UI Navigation & Sidebar
export const CUSTOMER_FACING_CATEGORIES = [
  { name: 'All Categories', slug: '' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Fashion & Apparel', slug: 'fashion' },
  { name: 'Home & Living', slug: 'home-living' },
  { name: 'Beauty & Fragrance', slug: 'beauty' },
  { name: 'Sports & Active', slug: 'sports' },
  { name: 'Books & Stationeries', slug: 'books' },
  { name: 'Deals & Offers', slug: 'deals' },
];

// Explicit Customer-Facing Display Labels Mapping (Bug 3 Fix)
export const CATEGORY_DISPLAY_LABELS = {
  'electronics': 'Electronics',
  'fashion': 'Fashion & Apparel',
  'home-living': 'Home & Living',
  'beauty': 'Beauty & Fragrance',
  'sports': 'Sports & Active',
  'books': 'Books & Stationeries',
  'deals': 'Deals & Offers',
};

export const getCategoryDisplayLabel = (slug) => {
  if (!slug) return 'All Categories';
  const normalized = slug.toLowerCase().trim();
  return CATEGORY_DISPLAY_LABELS[normalized] || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

// Common search keyword aliases for enhanced search UX
const SEARCH_KEYWORD_ALIASES = {
  perfume: ['perfume', 'fragrance', 'fragrances', 'scent', 'eau de parfum', 'cologne', 'aroma', 'essence'],
  phone: ['phone', 'smartphone', 'smartphones', 'mobile', 'cellular', 'iphone'],
  laptop: ['laptop', 'laptops', 'computer', 'notebook', 'macbook'],
  shirt: ['shirt', 'shirts', 'top', 'tops', 'dress', 'clothing'],
  shoe: ['shoe', 'shoes', 'sneaker', 'footwear'],
  watch: ['watch', 'watches', 'smartwatch'],
  beauty: ['beauty', 'skincare', 'skin care', 'makeup', 'cosmetic', 'lipstick', 'mascara', 'essence', 'serum', 'eyeshadow', 'powder', 'nail polish'],
};

export const VALID_SORT_VALUES = new Set([
  'relevance',
  'price-asc',
  'price-desc',
  'rating-desc',
  'newest',
]);

export const parseFilterParams = (searchParams) => {
  const search = (searchParams.get('search') || searchParams.get('q') || '').trim();
  const category = (searchParams.get('category') || '').trim();
  const brandRaw = searchParams.get('brand') || '';
  const brand = brandRaw ? brandRaw.split(',').map((b) => b.trim()).filter(Boolean) : [];

  const minPriceRaw = searchParams.get('minPrice');
  const maxPriceRaw = searchParams.get('maxPrice');
  const minPriceParsed = minPriceRaw !== null && minPriceRaw !== '' ? parseFloat(minPriceRaw) : null;
  const maxPriceParsed = maxPriceRaw !== null && maxPriceRaw !== '' ? parseFloat(maxPriceRaw) : null;

  let minPrice =
    minPriceParsed !== null && !isNaN(minPriceParsed) && minPriceParsed >= 0 ? minPriceParsed : null;
  let maxPrice =
    maxPriceParsed !== null && !isNaN(maxPriceParsed) && maxPriceParsed >= 0 ? maxPriceParsed : null;

  // Auto-correct inverted price boundaries (minPrice > maxPrice)
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    const temp = minPrice;
    minPrice = maxPrice;
    maxPrice = temp;
  }

  const ratingRaw = searchParams.get('rating');
  const ratingParsed = ratingRaw !== null && ratingRaw !== '' ? parseFloat(ratingRaw) : null;
  const rating =
    ratingParsed !== null && !isNaN(ratingParsed) && ratingParsed >= 1 && ratingParsed <= 5
      ? ratingParsed
      : null;

  const sortRaw = (searchParams.get('sort') || '').trim().toLowerCase();
  const sort = VALID_SORT_VALUES.has(sortRaw) ? sortRaw : 'relevance';

  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  return {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    sort,
    page,
  };
};

export const extractAvailableBrands = (products = []) => {
  const brandsSet = new Set();
  products.forEach((p) => {
    if (p.brand && typeof p.brand === 'string') {
      brandsSet.add(p.brand.trim());
    }
  });
  return Array.from(brandsSet).sort();
};

export const countActiveFilters = (params) => {
  let count = 0;
  if (params.category) count += 1;
  if (params.brand && params.brand.length > 0) count += params.brand.length;
  if (params.minPrice !== null || params.maxPrice !== null) count += 1;
  if (params.rating !== null) count += 1;
  return count;
};

export const applyFilterPipeline = (products = [], params = {}) => {
  let result = [...products];

  // 1. Search Query Matching (Client-Side Search with Keyword Aliases & Case-Insensitive Token Matching)
  const rawSearch = typeof params.search === 'string' ? params.search.trim() : '';
  if (rawSearch) {
    const normalizedQuery = rawSearch.toLowerCase().replace(/\s+/g, ' ');
    const tokens = normalizedQuery.split(' ').filter(Boolean);

    // Helper to test if a token or any of its semantic aliases appears in the text
    const tokenMatches = (token, text) => {
      if (text.includes(token)) return true;
      for (const group of Object.values(SEARCH_KEYWORD_ALIASES)) {
        if (group.includes(token)) {
          if (group.some((alias) => text.includes(alias))) {
            return true;
          }
        }
      }
      return false;
    };

    result = result.filter((p) => {
      if (!p) return false;
      const title = (p.title || p.name || '').toString().toLowerCase();
      const description = (p.description || '').toString().toLowerCase();
      const brand = (p.brand || '').toString().toLowerCase();
      const category = (p.category || '').toString().toLowerCase();
      const tags = Array.isArray(p.tags)
        ? p.tags.join(' ').toLowerCase()
        : typeof p.tags === 'string'
        ? p.tags.toLowerCase()
        : '';

      const fullText = `${title} ${description} ${brand} ${category} ${tags}`;

      // 1. Exact full query match
      if (fullText.includes(normalizedQuery)) {
        return true;
      }

      // 2. Token-level matching (every token or its alias must match in product metadata)
      if (tokens.length > 0 && tokens.every((token) => tokenMatches(token, fullText))) {
        return true;
      }

      return false;
    });
  }

  // 2. Category Filter
  if (params.category) {
    const targetSlug = params.category.toLowerCase().trim();

    if (targetSlug === 'deals') {
      // Deals & Offers: filter products with discountPercentage >= 10
      result = result.filter((p) => (p.discountPercentage || 0) >= 10);
    } else if (targetSlug === 'books') {
      // Books & Stationeries: DummyJSON has no native books category -> empty result
      result = [];
    } else {
      const mappedSlugs = CATEGORY_MAP[targetSlug] || [targetSlug];
      const targetSet = new Set(mappedSlugs.map((s) => s.toLowerCase().trim()));
      result = result.filter((p) => {
        const pCat = (p.category || '').toLowerCase().trim();
        return targetSet.has(pCat);
      });
    }
  }

  // 3. Multi-Brand Filter (OR logic between selected brands)
  if (params.brand && params.brand.length > 0) {
    const selectedBrands = new Set(params.brand.map((b) => b.toLowerCase().trim()));
    result = result.filter((p) => {
      const pBrand = (p.brand || '').toLowerCase().trim();
      return selectedBrands.has(pBrand);
    });
  }

  // 4. Price Range Filter (strictly on numeric selling price)
  if (params.minPrice !== null && !isNaN(params.minPrice)) {
    const minVal = Number(params.minPrice);
    result = result.filter((p) => Number(p.price || 0) >= minVal);
  }
  if (params.maxPrice !== null && !isNaN(params.maxPrice)) {
    const maxVal = Number(params.maxPrice);
    result = result.filter((p) => Number(p.price || 0) <= maxVal);
  }

  // 5. Rating Threshold Filter
  if (params.rating !== null && !isNaN(params.rating)) {
    const minRating = Number(params.rating);
    result = result.filter((p) => Number(p.rating || 0) >= minRating);
  }

  // 6. Sorting Order Pipeline (operates on derived copied array with deterministic tie-breakers)
  switch (params.sort) {
    case 'price-asc':
      result.sort((a, b) => {
        const diff = Number(a?.price || 0) - Number(b?.price || 0);
        return diff !== 0 ? diff : (a?.id || 0) - (b?.id || 0);
      });
      break;
    case 'price-desc':
      result.sort((a, b) => {
        const diff = Number(b?.price || 0) - Number(a?.price || 0);
        return diff !== 0 ? diff : (a?.id || 0) - (b?.id || 0);
      });
      break;
    case 'rating-desc':
      result.sort((a, b) => {
        const diff = Number(b?.rating || 0) - Number(a?.rating || 0);
        return diff !== 0 ? diff : (a?.id || 0) - (b?.id || 0);
      });
      break;
    case 'newest':
      result.sort((a, b) => (b?.id || 0) - (a?.id || 0));
      break;
    case 'relevance':
    default:
      break;
  }

  return result;
};

// Filter out brand selections that are incompatible with a target category or catalog
export const getCompatibleBrandsForCategory = (products = [], categorySlug = '', currentBrands = []) => {
  if (!currentBrands || currentBrands.length === 0) return [];

  // If category is specified, scope products to that category; otherwise validate against catalog
  const targetProducts = categorySlug
    ? applyFilterPipeline(products, { category: categorySlug })
    : products;

  if (!targetProducts || targetProducts.length === 0) return [];

  const categoryBrandsSet = new Set(
    extractAvailableBrands(targetProducts).map((b) => b.toLowerCase().trim())
  );

  return currentBrands.filter((b) => categoryBrandsSet.has(b.toLowerCase().trim()));
};

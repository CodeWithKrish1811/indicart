import { createSlice, createSelector } from '@reduxjs/toolkit';

/**
 * ARCHITECTURE EXPLANATION:
 * - Stores normalized wishlist items: [{ id, title, brand, category, price, originalPrice, discountPercentage, thumbnail, stock }]
 * - Deduplicates products by ID; adding the same product twice will not create duplicates.
 * - Safely handles missing, null, or malformed product data with sensible fallbacks.
 * - State is persisted across browser refreshes via redux-persist.
 */

const initialState = {
  items: [],
};

const normalizeProduct = (product) => {
  if (!product || product.id === undefined || product.id === null) return null;

  const maxStock =
    typeof product.stock === 'number' && Number.isFinite(product.stock) && product.stock >= 0
      ? product.stock
      : 10;

  const price =
    typeof product.price === 'number' && Number.isFinite(product.price) && product.price >= 0
      ? product.price
      : 0;

  const originalPrice =
    typeof product.originalPrice === 'number' && Number.isFinite(product.originalPrice)
      ? product.originalPrice
      : price;

  const discountPercentage =
    typeof product.discountPercentage === 'number' && Number.isFinite(product.discountPercentage)
      ? Math.max(0, Math.min(100, product.discountPercentage))
      : 0;

  const thumbnail =
    product.thumbnail ||
    (Array.isArray(product.images) && product.images[0]) ||
    '';

  return {
    id: product.id,
    title: product.title || product.name || 'Indicart Item',
    brand: product.brand || product.category || 'Indicart',
    category: product.category || '',
    price,
    originalPrice,
    discountPercentage,
    thumbnail,
    stock: maxStock,
  };
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      if (!Array.isArray(state.items)) {
        state.items = [];
      }
      const product = action.payload;
      const normalized = normalizeProduct(product);
      if (!normalized) return;

      const targetIdStr = String(normalized.id);
      const exists = state.items.some(
        (item) => item && item.id !== undefined && String(item.id) === targetIdStr
      );

      // Duplicate prevention rule: do not add if item already exists
      if (!exists) {
        state.items.push(normalized);
      }
    },

    removeFromWishlist: (state, action) => {
      if (!Array.isArray(state.items)) {
        state.items = [];
        return;
      }
      const rawId = action.payload?.id !== undefined ? action.payload.id : action.payload;
      if (rawId === undefined || rawId === null) return;

      const targetIdStr = String(rawId);
      state.items = state.items.filter(
        (item) => item && item.id !== undefined && String(item.id) !== targetIdStr
      );
    },

    toggleWishlist: (state, action) => {
      if (!Array.isArray(state.items)) {
        state.items = [];
      }
      const product = action.payload;
      const normalized = normalizeProduct(product);
      if (!normalized) return;

      const targetIdStr = String(normalized.id);
      const index = state.items.findIndex(
        (item) => item && item.id !== undefined && String(item.id) === targetIdStr
      );

      if (index > -1) {
        state.items.splice(index, 1);
      } else {
        state.items.push(normalized);
      }
    },

    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
} = wishlistSlice.actions;

// Base Selectors
export const selectWishlistState = (state) => state.wishlist;

export const selectWishlistItems = createSelector(
  [selectWishlistState],
  (wishlist) => {
    const rawItems = Array.isArray(wishlist?.items) ? wishlist.items : [];
    // Ensure uniqueness by ID and normalize missing data defensively
    const seen = new Set();
    const unique = [];

    rawItems.forEach((item) => {
      const normalized = normalizeProduct(item);
      if (!normalized) return;

      const idKey = String(normalized.id);
      if (!seen.has(idKey)) {
        seen.add(idKey);
        unique.push(normalized);
      }
    });

    return unique;
  }
);

export const selectWishlistCount = createSelector(
  [selectWishlistItems],
  (items) => items.length
);

export const selectIsInWishlist = createSelector(
  [selectWishlistItems, (_state, productId) => productId],
  (items, productId) => {
    if (productId === undefined || productId === null) return false;
    const targetIdStr = String(productId);
    return items.some((item) => String(item.id) === targetIdStr);
  }
);

export default wishlistSlice.reducer;

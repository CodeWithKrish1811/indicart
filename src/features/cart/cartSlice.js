import { createSlice, createSelector } from '@reduxjs/toolkit';
import { calculateCartTotals } from '../../utils/cartCalculations.js';

/**
 * ARCHITECTURE EXPLANATION:
 * - Cart state stores normalized cart items: [{ id, quantity, price, originalPrice, discountPercentage, title, brand, category, thumbnail, stock }]
 * - Price calculations (subtotal, tax 18% GST, shipping fee, discount, grand total) are calculated
 *   using RTK memoized derived selectors (`createSelector`).
 * - Quantity updates reject invalid values; quantities cannot fall below 1 unless the item is removed.
 * - Duplicate products follow a consistent rule: find existing item by ID and increment quantity up to available stock.
 */

const initialState = {
  items: [],
  appliedCoupon: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload || {};
      if (!product || product.id === undefined || product.id === null) return;

      const maxStock =
        typeof product.stock === 'number' && Number.isFinite(product.stock) && product.stock >= 0
          ? product.stock
          : 99;
      if (maxStock <= 0) return;

      const parsedQty = Math.floor(Number(quantity));
      if (!Number.isFinite(parsedQty) || parsedQty < 1) {
        // Reject invalid quantity updates
        return;
      }
      const validQuantity = parsedQty;

      // Duplicate products follow a consistent rule: find existing by id
      const existingIndex = state.items.findIndex(
        (item) => String(item.id) === String(product.id)
      );

      if (existingIndex > -1) {
        const existingItem = state.items[existingIndex];
        const currentQty =
          typeof existingItem.quantity === 'number' &&
          Number.isFinite(existingItem.quantity) &&
          existingItem.quantity >= 1
            ? Math.floor(existingItem.quantity)
            : 1;
        const newQty = currentQty + validQuantity;
        state.items[existingIndex].quantity = Math.max(1, Math.min(newQty, maxStock));
      } else {
        state.items.push({
          id: product.id,
          title: product.title || product.name || 'Indicart Item',
          brand: product.brand || 'Indicart',
          category: product.category || '',
          price:
            typeof product.price === 'number' && Number.isFinite(product.price) && product.price >= 0
              ? product.price
              : 0,
          originalPrice:
            typeof product.originalPrice === 'number' && Number.isFinite(product.originalPrice)
              ? product.originalPrice
              : product.price || 0,
          discountPercentage:
            typeof product.discountPercentage === 'number' && Number.isFinite(product.discountPercentage)
              ? product.discountPercentage
              : 0,
          thumbnail: product.thumbnail || (Array.isArray(product.images) && product.images[0]) || '',
          stock: maxStock,
          quantity: Math.max(1, Math.min(validQuantity, maxStock)),
        });
      }
    },

    removeFromCart: (state, action) => {
      const productId = action.payload;
      if (productId === undefined || productId === null) return;
      state.items = state.items.filter((item) => String(item.id) !== String(productId));
      if (state.items.length === 0) {
        state.appliedCoupon = null;
      }
    },

    increaseQuantity: (state, action) => {
      const productId = action.payload;
      if (productId === undefined || productId === null) return;
      const item = state.items.find((i) => String(i.id) === String(productId));
      if (item) {
        const maxStock =
          typeof item.stock === 'number' && Number.isFinite(item.stock) && item.stock >= 0
            ? item.stock
            : 99;
        const currentQty =
          typeof item.quantity === 'number' && Number.isFinite(item.quantity) && item.quantity >= 1
            ? Math.floor(item.quantity)
            : 1;
        if (currentQty < maxStock) {
          item.quantity = currentQty + 1;
        }
      }
    },

    decreaseQuantity: (state, action) => {
      const productId = action.payload;
      if (productId === undefined || productId === null) return;
      const item = state.items.find((i) => String(i.id) === String(productId));
      // Quantities cannot fall below one unless the item is removed
      if (item) {
        const currentQty =
          typeof item.quantity === 'number' && Number.isFinite(item.quantity) && item.quantity >= 1
            ? Math.floor(item.quantity)
            : 1;
        if (currentQty > 1) {
          item.quantity = currentQty - 1;
        }
      }
    },

    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload || {};
      if (productId === undefined || productId === null) return;

      // Reject non-numeric, decimal or sub-1 quantities
      const parsedQty = Math.floor(Number(quantity));
      if (!Number.isFinite(parsedQty) || parsedQty < 1) {
        return;
      }

      const item = state.items.find((i) => String(i.id) === String(productId));
      if (item) {
        const maxStock =
          typeof item.stock === 'number' && Number.isFinite(item.stock) && item.stock >= 0
            ? item.stock
            : 99;
        if (maxStock <= 0) return;
        item.quantity = Math.max(1, Math.min(parsedQty, maxStock));
      }
    },

    setAppliedCoupon: (state, action) => {
      state.appliedCoupon = action.payload;
    },

    removeAppliedCoupon: (state) => {
      state.appliedCoupon = null;
    },

    clearCart: (state) => {
      state.items = [];
      state.appliedCoupon = null;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  updateQuantity,
  setAppliedCoupon,
  removeAppliedCoupon,
  clearCart,
} = cartSlice.actions;

// Base Selectors
export const selectCartState = (state) => state.cart;

export const selectCartItems = createSelector(
  [selectCartState],
  (cart) => {
    const rawItems = cart?.items || [];
    // Deduplicate items consistently if duplicate IDs exist
    const map = new Map();
    rawItems.forEach((item) => {
      if (!item || item.id === undefined || item.id === null) return;
      const idKey = String(item.id);
      const maxStock =
        typeof item.stock === 'number' && Number.isFinite(item.stock) && item.stock >= 0
          ? item.stock
          : 99;
      const parsedQty = Math.floor(Number(item.quantity));
      const validQty = Number.isFinite(parsedQty) && parsedQty >= 1 ? parsedQty : 1;

      if (map.has(idKey)) {
        const existing = map.get(idKey);
        const combined = Math.min(existing.quantity + validQty, Math.max(existing.stock, maxStock));
        existing.quantity = Math.max(1, combined);
      } else {
        map.set(idKey, {
          ...item,
          stock: maxStock,
          quantity: Math.max(1, Math.min(validQty, maxStock)),
        });
      }
    });
    return Array.from(map.values());
  }
);

export const selectAppliedCoupon = createSelector(
  [selectCartState],
  (cart) => cart?.appliedCoupon || null
);

// Memoized derived selectors for Price Calculations
export const selectCartTotals = createSelector(
  [selectCartItems, selectAppliedCoupon],
  (items, coupon) => calculateCartTotals(items, coupon)
);

export const selectCartItemCount = createSelector(
  [selectCartTotals],
  (totals) => totals.totalItemCount
);

export const selectCartSubtotal = createSelector(
  [selectCartTotals],
  (totals) => totals.subtotal
);

export const selectCartTax = createSelector(
  [selectCartTotals],
  (totals) => totals.tax
);

export const selectCartShipping = createSelector(
  [selectCartTotals],
  (totals) => totals.shipping
);

export const selectCartCouponDiscount = createSelector(
  [selectCartTotals],
  (totals) => totals.couponDiscount
);

export const selectCartGrandTotal = createSelector(
  [selectCartTotals],
  (totals) => totals.grandTotal
);

export default cartSlice.reducer;

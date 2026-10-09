import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { clearCart } from '../cart/cartSlice';
import { firestoreOrderService } from '../../services/firestoreOrderService';

/**
 * ARCHITECTURE EXPLANATION:
 * - Manages order placement and order history using `createAsyncThunk`.
 * - Automatically saves placed orders to Firebase Firestore.
 * - Automatically clears cart upon successful order placement and updates order history.
 */

export const placeOrderThunk = createAsyncThunk(
  'orders/placeOrder',
  async (orderPayload, { dispatch }) => {
    const newOrder = {
      orderId: orderPayload.orderId || `ORD-IND-${Math.floor(100000 + Math.random() * 900000)}`,
      orderDate: new Date().toISOString(),
      userEmail: orderPayload.userEmail || 'customer@indicart.com',
      userName: orderPayload.userName || 'Customer',
      items: orderPayload.items || [],
      subtotal: orderPayload.subtotal || 0,
      discount: orderPayload.discount || 0,
      coupon: orderPayload.coupon || null,
      tax: orderPayload.tax || 0,
      shipping: orderPayload.shipping || 0,
      total: orderPayload.total || 0,
      address: orderPayload.address || {},
      deliveryMethod: orderPayload.deliveryMethod || 'Standard Delivery',
      paymentMethod: orderPayload.paymentMethod || 'Cash on Delivery',
      status: 'Processing',
    };

    // Attempt to persist in Firebase Firestore
    try {
      await firestoreOrderService.saveOrder(newOrder);
    } catch (e) {
      console.warn('Note: Could not sync order to Firestore immediately, saved locally.', e);
    }

    // Automatically clear cart state in Redux
    dispatch(clearCart());

    return newOrder;
  }
);

export const fetchFirestoreOrdersThunk = createAsyncThunk(
  'orders/fetchFirestoreOrders',
  async (userEmail) => {
    if (!userEmail) return [];
    try {
      const orders = await firestoreOrderService.getUserOrders(userEmail);
      return orders;
    } catch (e) {
      console.warn('Error fetching Firestore orders:', e);
      return [];
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        // Avoid duplicates if orderId already exists
        const exists = state.orders.some((o) => o.orderId === action.payload.orderId);
        if (!exists) {
          state.orders.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(placeOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to place order.';
      })
      .addCase(fetchFirestoreOrdersThunk.fulfilled, (state, action) => {
        if (action.payload && action.payload.length > 0) {
          // Merge remote orders with local orders without duplicates
          const currentIds = new Set(state.orders.map((o) => o.orderId));
          const newOrders = action.payload.filter((o) => !currentIds.has(o.orderId));
          state.orders = [...state.orders, ...newOrders];
        }
      });
  },
});

export const { setCurrentOrder, clearCurrentOrder } = ordersSlice.actions;

export const selectOrdersState = (state) => state.orders;
export const selectAllOrders = createSelector(
  [selectOrdersState],
  (ordersState) => ordersState?.orders || []
);
export const selectCurrentOrder = createSelector(
  [selectOrdersState],
  (ordersState) => ordersState?.currentOrder || null
);
export const selectOrdersLoading = createSelector(
  [selectOrdersState],
  (ordersState) => ordersState?.loading || false
);

// Filter orders for active user
export const selectUserOrders = createSelector(
  [selectAllOrders, (_state, userEmail) => userEmail],
  (orders, userEmail) => {
    if (!userEmail) return orders;
    return orders.filter(
      (o) => o.userEmail && o.userEmail.toLowerCase() === userEmail.toLowerCase()
    );
  }
);

export default ordersSlice.reducer;

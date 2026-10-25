import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  increaseQuantity as increaseQuantityAction,
  decreaseQuantity as decreaseQuantityAction,
  updateQuantity as updateQuantityAction,
  clearCart as clearCartAction,
  setAppliedCoupon,
  removeAppliedCoupon,
  selectCartItems,
  selectCartTotals,
  selectAppliedCoupon,
} from '../features/cart/cartSlice';
import { addToWishlist as addToWishlistAction } from '../features/wishlist/wishlistSlice';
import { applyCouponThunk } from '../features/coupons/couponSlice';
import { useToast } from './ToastContext';

/**
 * CartContext Bridge Hook:
 * Connects React components calling `useCart()` seamlessly to Redux Toolkit cartSlice & memoized selectors.
 */
const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const cartItems = useSelector(selectCartItems);
  const totals = useSelector(selectCartTotals);
  const appliedCoupon = useSelector(selectAppliedCoupon);

  const addToCart = (product, quantity = 1) => {
    if (!product || product.id === undefined || product.id === null) return;
    const maxStock =
      typeof product.stock === 'number' && Number.isFinite(product.stock) && product.stock >= 0
        ? product.stock
        : 99;

    if (maxStock <= 0) {
      showToast('Sorry, this product is currently out of stock.');
      return;
    }

    const parsedQty = Math.floor(Number(quantity));
    if (!Number.isFinite(parsedQty) || parsedQty < 1) {
      showToast('Please enter a valid quantity of at least 1.');
      return;
    }

    const existingItem = cartItems.find((i) => String(i.id) === String(product.id));
    if (existingItem) {
      const currentQty = existingItem.quantity || 1;
      if (currentQty >= maxStock) {
        showToast(`Item is already in your cart with maximum stock (${maxStock}).`);
        return;
      }
      if (currentQty + parsedQty > maxStock) {
        const canAdd = maxStock - currentQty;
        dispatch(addToCartAction({ product, quantity: canAdd }));
        showToast(`Added ${canAdd} item${canAdd > 1 ? 's' : ''} to reach maximum stock (${maxStock}).`);
        return;
      }
    }

    dispatch(addToCartAction({ product, quantity: parsedQty }));
    showToast('Added to cart!');
  };

  const removeFromCart = (productId) => {
    if (productId === undefined || productId === null) return;
    dispatch(removeFromCartAction(productId));
    showToast('Removed from cart');
  };

  const increaseQuantity = (productId) => {
    if (productId === undefined || productId === null) return;
    const item = cartItems.find((i) => String(i.id) === String(productId));
    if (item) {
      const maxStock =
        typeof item.stock === 'number' && Number.isFinite(item.stock) && item.stock >= 0
          ? item.stock
          : 99;
      if (item.quantity >= maxStock) {
        showToast(`Maximum stock limit of ${maxStock} reached.`);
        return;
      }
      dispatch(increaseQuantityAction(productId));
    }
  };

  const decreaseQuantity = (productId) => {
    if (productId === undefined || productId === null) return;
    const item = cartItems.find((i) => String(i.id) === String(productId));
    // Quantities cannot fall below one unless the item is removed
    if (item) {
      if (item.quantity <= 1) {
        return;
      }
      dispatch(decreaseQuantityAction(productId));
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (productId === undefined || productId === null) return;
    const parsedQty = Math.floor(Number(quantity));
    if (!Number.isFinite(parsedQty) || parsedQty < 1) {
      showToast('Quantity must be at least 1.');
      return;
    }

    const item = cartItems.find((i) => String(i.id) === String(productId));
    if (item) {
      const maxStock =
        typeof item.stock === 'number' && Number.isFinite(item.stock) && item.stock >= 0
          ? item.stock
          : 99;
      if (parsedQty > maxStock) {
        showToast(`Maximum stock limit of ${maxStock} reached.`);
      }
      dispatch(updateQuantityAction({ productId, quantity: Math.min(parsedQty, maxStock) }));
    }
  };

  const moveToWishlist = (productId) => {
    const itemToMove = cartItems.find((i) => String(i.id) === String(productId));
    if (itemToMove) {
      dispatch(addToWishlistAction(itemToMove));
      dispatch(removeFromCartAction(productId));
      showToast('Moved item to wishlist');
    }
  };

  const applyCouponCode = async (code) => {
    if (!code) return { valid: false, message: 'Please enter a promo code.' };
    
    try {
      const coupon = await dispatch(
        applyCouponThunk({ code, subtotal: totals.subtotal })
      ).unwrap();

      dispatch(setAppliedCoupon(coupon));
      showToast(`Coupon ${coupon.code} applied successfully!`);
      return { valid: true, coupon, message: `Coupon ${coupon.code} applied!` };
    } catch (errorMsg) {
      const message = typeof errorMsg === 'string' ? errorMsg : 'Invalid promo code.';
      showToast(message);
      return { valid: false, message };
    }
  };

  const removeCoupon = () => {
    dispatch(removeAppliedCoupon());
    showToast('Coupon removed');
  };

  const clearCart = () => {
    dispatch(clearCartAction());
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemCount: totals.totalItemCount,
        totals,
        appliedCoupon,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        moveToWishlist,
        applyCouponCode,
        removeCoupon,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

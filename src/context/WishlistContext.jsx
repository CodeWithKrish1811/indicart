import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addToWishlist as addToWishlistAction,
  removeFromWishlist as removeFromWishlistAction,
  toggleWishlist as toggleWishlistAction,
  clearWishlist as clearWishlistAction,
  selectWishlistItems,
  selectWishlistCount,
} from '../features/wishlist/wishlistSlice';
import { useToast } from './ToastContext';

/**
 * WishlistContext Bridge Hook:
 * Connects components using `useWishlist()` directly to Redux Toolkit wishlistSlice.
 */
const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const wishlistItems = useSelector(selectWishlistItems);
  const wishlistCount = useSelector(selectWishlistCount);

  const isInWishlist = (productId) => {
    if (productId === undefined || productId === null) return false;
    const targetIdStr = String(productId?.id !== undefined ? productId.id : productId);
    return wishlistItems.some((item) => item && item.id !== undefined && String(item.id) === targetIdStr);
  };

  const addToWishlist = (product) => {
    if (!product || product.id === undefined || product.id === null) return;
    if (isInWishlist(product.id)) {
      showToast('Item is already in your wishlist');
      return;
    }
    dispatch(addToWishlistAction(product));
    showToast('Saved to wishlist!');
  };

  const removeFromWishlist = (target) => {
    const rawId = target?.id !== undefined ? target.id : target;
    if (rawId === undefined || rawId === null) return;
    dispatch(removeFromWishlistAction(rawId));
    showToast('Removed from wishlist');
  };

  const toggleWishlist = (product) => {
    if (!product || product.id === undefined || product.id === null) return;
    const exists = isInWishlist(product.id);
    dispatch(toggleWishlistAction(product));
    showToast(exists ? 'Removed from wishlist' : 'Saved to wishlist!');
  };

  const clearWishlist = () => {
    dispatch(clearWishlistAction());
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

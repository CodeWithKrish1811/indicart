/**
 * Centralized cart price calculation logic
 */
export const calculateCartTotals = (items = [], appliedCoupon = null, deliveryFeeOverride = null) => {
  const safeItems = Array.isArray(items) ? items : [];

  // 1. Calculate Raw Subtotal & Product Level Savings
  let subtotal = 0;
  let totalProductSavings = 0;
  let totalItemCount = 0;

  safeItems.forEach((item) => {
    if (!item) return;

    const itemPrice =
      typeof item.price === 'number' && Number.isFinite(item.price) && item.price >= 0
        ? item.price
        : 0;

    // Reject non-numeric, decimal or sub-1 quantities; ensure integer >= 1
    const rawQty = Math.floor(Number(item.quantity));
    const qty = Number.isFinite(rawQty) && rawQty >= 1 ? rawQty : 1;

    subtotal += itemPrice * qty;
    totalItemCount += qty;

    const originalPrice =
      typeof item.originalPrice === 'number' && Number.isFinite(item.originalPrice)
        ? item.originalPrice
        : 0;

    if (originalPrice > itemPrice) {
      totalProductSavings += (originalPrice - itemPrice) * qty;
    } else if (
      typeof item.discountPercentage === 'number' &&
      item.discountPercentage > 0 &&
      item.discountPercentage < 100
    ) {
      const calculatedOriginal = itemPrice / (1 - item.discountPercentage / 100);
      totalProductSavings += (calculatedOriginal - itemPrice) * qty;
    }
  });

  // 2. Calculate Coupon Discount Amount with minSubtotal compliance
  let couponDiscount = 0;
  if (appliedCoupon && subtotal > 0) {
    const minSubtotal =
      typeof appliedCoupon.minSubtotal === 'number' && Number.isFinite(appliedCoupon.minSubtotal)
        ? appliedCoupon.minSubtotal
        : 0;

    // Only apply discount if current subtotal meets coupon's minimum requirement
    if (subtotal >= minSubtotal) {
      if (appliedCoupon.type === 'percentage') {
        const discountPercent =
          typeof appliedCoupon.discount === 'number' && Number.isFinite(appliedCoupon.discount)
            ? appliedCoupon.discount
            : 0;
        couponDiscount = Math.round(((subtotal * discountPercent) / 100) * 100) / 100;
      } else if (appliedCoupon.type === 'flat') {
        const flatDiscount =
          typeof appliedCoupon.discount === 'number' && Number.isFinite(appliedCoupon.discount)
            ? appliedCoupon.discount
            : 0;
        couponDiscount = Math.min(flatDiscount, subtotal);
      }
    }
  }

  // Ensure coupon discount never exceeds subtotal
  couponDiscount = Math.min(couponDiscount, subtotal);

  const taxableSubtotal = Math.max(0, subtotal - couponDiscount);

  // 3. Tax Calculation (18% GST on net taxable subtotal, rounded to 2 decimals)
  const tax = taxableSubtotal > 0 ? Math.round(taxableSubtotal * 0.18 * 100) / 100 : 0;

  // 4. Shipping Calculation (Free above ₹499 subtotal, else ₹50 fixed charge; empty cart = 0)
  let shipping = 0;
  if (subtotal === 0) {
    shipping = 0;
  } else if (deliveryFeeOverride !== null && deliveryFeeOverride !== undefined) {
    shipping =
      typeof deliveryFeeOverride === 'number' &&
      Number.isFinite(deliveryFeeOverride) &&
      deliveryFeeOverride >= 0
        ? deliveryFeeOverride
        : 0;
  } else if (subtotal < 499) {
    shipping = 50;
  } else {
    shipping = 0;
  }

  // 5. Grand Total Calculation
  const grandTotal = Math.round((taxableSubtotal + tax + shipping) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalProductSavings: Math.round(totalProductSavings * 100) / 100,
    couponDiscount,
    taxableSubtotal: Math.round(taxableSubtotal * 100) / 100,
    tax,
    shipping,
    grandTotal,
    totalItemCount,
  };
};

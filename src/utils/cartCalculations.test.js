import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  calculateItemTotal,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
  GST_RATE,
} from './cartCalculations.js';
import { formatCurrency, formatPriceShort } from './formatCurrency.js';

describe('cartCalculations Edge Cases', () => {
  describe('calculateCartTotals with empty/invalid carts', () => {
    it('returns zero totals for empty items array', () => {
      const result = calculateCartTotals([]);
      assert.deepStrictEqual(result, {
        subtotal: 0,
        totalProductSavings: 0,
        couponDiscount: 0,
        taxableSubtotal: 0,
        tax: 0,
        shipping: 0,
        grandTotal: 0,
        totalItemCount: 0,
      });
    });

    it('returns zero totals for null or undefined items', () => {
      const nullResult = calculateCartTotals(null);
      const undefinedResult = calculateCartTotals(undefined);
      assert.equal(nullResult.subtotal, 0);
      assert.equal(nullResult.grandTotal, 0);
      assert.equal(undefinedResult.subtotal, 0);
      assert.equal(undefinedResult.grandTotal, 0);
    });

    it('never charges shipping on an empty cart even if delivery override is provided', () => {
      const result = calculateCartTotals([], null, 120);
      assert.equal(result.shipping, 0);
      assert.equal(result.grandTotal, 0);
    });
  });

  describe('Invalid monetary & quantity inputs', () => {
    it('rejects negative, NaN, and non-numeric prices safely', () => {
      const items = [
        { id: 1, price: -50, quantity: 1 },
        { id: 2, price: NaN, quantity: 2 },
        { id: 3, price: 'invalid_price', quantity: 1 },
        { id: 4, price: 100, quantity: 1 },
      ];
      const result = calculateCartTotals(items);
      // Only item 4 (price: 100) should contribute
      assert.equal(result.subtotal, 100);
      assert.equal(result.totalItemCount, 5); // 1 + 2 + 1 + 1
    });

    it('sanitizes sub-one, zero, decimal, and string quantities', () => {
      const items = [
        { id: 1, price: 100, quantity: 0 }, // fallback to 1
        { id: 2, price: 100, quantity: -5 }, // fallback to 1
        { id: 3, price: 100, quantity: 'not_a_num' }, // fallback to 1
        { id: 4, price: 100, quantity: 2.8 }, // floored to 2
      ];
      const result = calculateCartTotals(items);
      assert.equal(result.subtotal, 500); // 100*1 + 100*1 + 100*1 + 100*2 = 500
      assert.equal(result.totalItemCount, 5);
    });
  });

  describe('Shipping calculation rules', () => {
    it(`charges standard fee ₹${STANDARD_SHIPPING_FEE} for subtotal below ₹${FREE_SHIPPING_THRESHOLD}`, () => {
      const items = [{ id: 1, price: 300, quantity: 1 }];
      const result = calculateCartTotals(items);
      assert.equal(result.subtotal, 300);
      assert.equal(result.shipping, STANDARD_SHIPPING_FEE);
    });

    it(`provides free shipping for subtotal equal to or exceeding ₹${FREE_SHIPPING_THRESHOLD}`, () => {
      const itemsExact = [{ id: 1, price: FREE_SHIPPING_THRESHOLD, quantity: 1 }];
      const resultExact = calculateCartTotals(itemsExact);
      assert.equal(resultExact.shipping, 0);

      const itemsAbove = [{ id: 1, price: 1500, quantity: 1 }];
      const resultAbove = calculateCartTotals(itemsAbove);
      assert.equal(resultAbove.shipping, 0);
    });

    it('applies delivery fee override for express shipping when cart has items', () => {
      const items = [{ id: 1, price: 600, quantity: 1 }];
      const result = calculateCartTotals(items, null, 120);
      assert.equal(result.shipping, 120);
      // grandTotal = 600 + (600*0.18 = 108) + 120 = 828
      assert.equal(result.grandTotal, 828);
    });
  });

  describe('Coupon discounts & minimum subtotal compliance', () => {
    it('applies percentage coupon discount accurately', () => {
      assert.equal(GST_RATE, 0.18);
      const items = [{ id: 1, price: 1000, quantity: 1 }];
      const coupon = { code: 'SAVE10', type: 'percentage', discount: 10, minSubtotal: 0 };
      const result = calculateCartTotals(items, coupon);
      assert.equal(result.couponDiscount, 100);
      assert.equal(result.taxableSubtotal, 900);
      assert.equal(result.tax, 162); // 900 * 0.18
      assert.equal(result.shipping, 0);
      assert.equal(result.grandTotal, 1062);
    });

    it('rejects coupon discount if subtotal drops below coupon minSubtotal', () => {
      const items = [{ id: 1, price: 200, quantity: 1 }];
      const coupon = { code: 'FLAT50', type: 'flat', discount: 50, minSubtotal: 299 };
      const result = calculateCartTotals(items, coupon);
      assert.equal(result.couponDiscount, 0);
      assert.equal(result.taxableSubtotal, 200);
    });

    it('caps flat discount so it cannot exceed subtotal', () => {
      const items = [{ id: 1, price: 30, quantity: 1 }];
      const coupon = { code: 'BIGDISCOUNT', type: 'flat', discount: 100, minSubtotal: 0 };
      const result = calculateCartTotals(items, coupon);
      assert.equal(result.couponDiscount, 30);
      assert.equal(result.taxableSubtotal, 0);
      assert.equal(result.tax, 0);
    });
  });

  describe('calculateItemTotal line-item calculations', () => {
    it('calculates valid product total', () => {
      assert.equal(calculateItemTotal({ price: 250, quantity: 3 }), 750);
    });

    it('handles missing or malformed item', () => {
      assert.equal(calculateItemTotal(null), 0);
      assert.equal(calculateItemTotal({ price: 'abc', quantity: 2 }), 0);
      assert.equal(calculateItemTotal({ price: 150, quantity: -1 }), 150); // falls back to qty 1
    });
  });

  describe('formatCurrency utility edge cases', () => {
    it('formats standard positive numbers to Indian Rupee representation', () => {
      assert.equal(formatCurrency(1250), '₹1,250.00');
      assert.equal(formatCurrency(0), '₹0.00');
    });

    it('formats negative values with clean standard currency notation', () => {
      assert.equal(formatCurrency(-50), '-₹50.00');
    });

    it('handles null, undefined, booleans, and NaN safely', () => {
      assert.equal(formatCurrency(null), '₹0.00');
      assert.equal(formatCurrency(undefined), '₹0.00');
      assert.equal(formatCurrency(false), '₹0.00');
      assert.equal(formatCurrency(NaN), '₹0.00');
      assert.equal(formatCurrency('invalid'), '₹0.00');
    });

    it('formatPriceShort rounds properly with Indian numbering', () => {
      assert.equal(formatPriceShort(1500.8), '₹1,501');
      assert.equal(formatPriceShort(null), '₹0');
    });
  });
});

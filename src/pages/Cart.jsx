import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency';
import { calculateItemTotal, FREE_SHIPPING_THRESHOLD } from '../utils/cartCalculations';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import ProductImage from '../components/common/ProductImage';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    totals,
    appliedCoupon,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    removeFromCart,
    moveToWishlist,
    applyCouponCode,
    removeCoupon,
    clearCart,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput) return;
    applyCouponCode(couponInput);
    setCouponInput('');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          title="Your cart is empty."
          message="Looks like you haven't added anything to your cart yet. Explore our top categories and catalog products!"
          actionText="Continue Shopping"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Shopping Cart</h1>
          <p className="text-sm text-slate-500 mt-1">
            {totals.totalItemCount} {totals.totalItemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => {
            const itemPrice = typeof item.price === 'number' && Number.isFinite(item.price) && item.price >= 0 ? item.price : 0;
            const itemTotal = calculateItemTotal(item);
            const isAtMaxStock = item.quantity >= (item.stock || 99);

            return (
              <div
                key={item.id}
                className="glass-panel p-4 sm:p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-hover-lift"
              >
                <div className="flex items-center space-x-4 flex-1">
                  {/* Thumbnail */}
                  <Link
                    to={`/products/${item.id}`}
                    className="w-20 h-20 bg-[#F8F7FC] rounded-2xl border border-slate-200/80 flex items-center justify-center shrink-0 p-2 overflow-hidden hover:opacity-90 transition"
                  >
                    <ProductImage
                      src={item.thumbnail}
                      alt={item.title}
                      fallbackText={item.brand || item.category || 'Product'}
                      fallbackIconSize="w-6 h-6"
                      className="max-h-full max-w-full object-contain drop-shadow-sm"
                      loading="lazy"
                    />
                  </Link>

                  {/* Title & Brand */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#65A30D]">
                      {item.brand || item.category || 'Indicart'}
                    </span>
                    <Link
                      to={`/products/${item.id}`}
                      className="block text-sm font-bold text-slate-900 hover:text-[#65A30D] transition line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <div className="text-xs text-slate-500">
                      Price: <span className="font-bold text-slate-800">{formatCurrency(itemPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Subtotal */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-[#F8F7FC]">
                    <button
                      type="button"
                      disabled={item.quantity <= 1}
                      onClick={() => decreaseQuantity(item.id)}
                      aria-label={`Decrease quantity of ${item.title}`}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition font-bold text-sm cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={item.stock || 99}
                      value={item.quantity}
                      aria-label={`Quantity for ${item.title}`}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') return;
                        const num = parseInt(val, 10);
                        if (!Number.isNaN(num) && num >= 1) {
                          updateQuantity(item.id, num);
                        }
                      }}
                      onBlur={(e) => {
                        const num = parseInt(e.target.value, 10);
                        if (Number.isNaN(num) || num < 1) {
                          e.target.value = item.quantity;
                        }
                      }}
                      className="w-12 text-center text-xs font-bold text-slate-800 bg-transparent border-x border-slate-200 focus:outline-none focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      disabled={isAtMaxStock}
                      onClick={() => increaseQuantity(item.id)}
                      aria-label={`Increase quantity of ${item.title}`}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition font-bold text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Subtotal */}
                  <div className="text-right min-w-[90px]">
                    <div className="text-sm font-black text-slate-900">{formatCurrency(itemTotal)}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <button
                        type="button"
                        onClick={() => moveToWishlist(item.id)}
                        className="text-[11px] font-bold text-[#65A30D] hover:underline cursor-pointer"
                      >
                        Save for later
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center text-xs font-black uppercase tracking-wider text-[#65A30D] hover:underline space-x-1"
            >
              <span>&larr;</span>
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Coupon & Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Input Box */}
          <div className="glass-panel p-6 rounded-3xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Apply Promo Code</h3>
            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-emerald-800">{appliedCoupon.code}</span>
                  <p className="text-[11px] text-emerald-700">{appliedCoupon.description}</p>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SAVE10, FLAT50"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs bg-[#F8F7FC] border border-slate-200 rounded-xl focus:bg-white focus:border-[#84CC16] uppercase font-bold text-slate-900"
                />
                <Button type="submit" variant="outline" size="sm" className="text-xs font-bold border-slate-300">
                  Apply
                </Button>
              </form>
            )}
            <p className="text-[11px] text-slate-400 italic">
              Try demo codes: <strong className="text-slate-700">SAVE10</strong> (10% off), <strong className="text-slate-700">FLAT50</strong> (₹50 off), or <strong className="text-slate-700">WELCOME</strong>.
            </p>
          </div>

          {/* Price Breakdown Card */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({totals.totalItemCount} items)</span>
                <span className="font-bold text-slate-900">{formatCurrency(totals.subtotal)}</span>
              </div>

              {totals.totalProductSavings > 0 && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Product Savings</span>
                  <span>-{formatCurrency(totals.totalProductSavings)}</span>
                </div>
              )}

              {totals.couponDiscount > 0 ? (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-{formatCurrency(totals.couponDiscount)}</span>
                </div>
              ) : appliedCoupon && appliedCoupon.minSubtotal && totals.subtotal < appliedCoupon.minSubtotal ? (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                  Coupon <strong>{appliedCoupon.code}</strong> requires minimum cart subtotal of {formatCurrency(appliedCoupon.minSubtotal)}. Add {formatCurrency(appliedCoupon.minSubtotal - totals.subtotal)} more to activate discount.
                </div>
              ) : null}

              <div className="flex justify-between">
                <span>Estimated Tax (18% GST)</span>
                <span className="font-bold text-slate-900">{formatCurrency(totals.tax)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-slate-900">
                  {totals.shipping === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatCurrency(totals.shipping)
                  )}
                </span>
              </div>

              {totals.subtotal > 0 && totals.subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-[10px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  Add {formatCurrency(FREE_SHIPPING_THRESHOLD - totals.subtotal)} more to unlock <strong>FREE Shipping</strong>!
                </p>
              )}
            </div>

            <div className="border-t border-slate-200/80 pt-3 flex items-center justify-between">
              <span className="text-base font-black text-slate-900">Grand Total</span>
              <span className="text-xl font-black text-[#0A0A0A]">
                {formatCurrency(totals.grandTotal)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full btn-lime-gradient py-3.5 px-6 rounded-full font-black text-sm text-[#0A0A0A] uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer"
            >
              Proceed to Checkout &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

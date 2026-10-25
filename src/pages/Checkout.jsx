import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrderThunk } from '../features/orders/ordersSlice';
import { calculateCartTotals, calculateItemTotal } from '../utils/cartCalculations';
import { formatCurrency } from '../utils/formatCurrency';
import Button from '../components/common/Button';
import ProductImage from '../components/common/ProductImage';

/**
 * ARCHITECTURE EXPLANATION (Requirement 5):
 * - Multi-step Checkout Wizard (Address -> Delivery Option -> Payment -> Review Summary).
 * - Address form validation using react-hook-form + Yup schema.
 * - Protected route redirection handled by ProtectedRoute.
 * - Order placement executed via Redux `placeOrderThunk`.
 */

// Yup Validation Schema for Address Form
const addressSchema = yup.object().shape({
  fullName: yup.string().trim().required('Full Name is required'),
  phone: yup
    .string()
    .trim()
    .matches(/^[0-9+\s-]{10,15}$/, 'Enter a valid 10-digit phone number')
    .required('Phone number is required'),
  address: yup.string().trim().required('Street address is required'),
  city: yup.string().trim().required('City is required'),
  state: yup.string().trim().required('State is required'),
  postalCode: yup
    .string()
    .trim()
    .matches(/^[0-9]{6}$/, 'Postal PIN code must be exactly 6 digits')
    .required('Postal code is required'),
});

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, appliedCoupon } = useCart();
  const { currentUser } = useAuth();

  const [step, setStep] = useState(1);

  // Address Form using react-hook-form + yupResolver
  const {
    register: registerAddress,
    handleSubmit: handleAddressFormSubmit,
    formState: { errors: addressErrors },
    getValues: getAddressValues,
  } = useForm({
    resolver: yupResolver(addressSchema),
    defaultValues: {
      fullName: currentUser?.name || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
    },
  });

  const [savedAddress, setSavedAddress] = useState(null);

  // Delivery Method State
  const [deliveryMethod, setDeliveryMethod] = useState({
    id: 'standard',
    name: 'Standard Delivery',
    time: '3 - 5 Business Days',
    fee: null,
  });

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });
  const [paymentError, setPaymentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate Totals considering selected Delivery Method
  const deliveryFeeOverride = deliveryMethod.id === 'express' ? 120 : null;
  const totals = calculateCartTotals(cartItems, appliedCoupon, deliveryFeeOverride);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-sm text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <Button variant="primary" size="md" onClick={() => navigate('/products')}>
          Browse Products
        </Button>
      </div>
    );
  }

  // Address Form Submission (Step 1 -> Step 2)
  const onAddressValid = (data) => {
    setSavedAddress(data);
    setStep(2);
  };

  // Payment Validation & Final Order Submission via Redux Thunk
  const handlePlaceOrder = async () => {
    if (paymentMethod === 'upi' && !paymentDetails.upiId.trim()) {
      setPaymentError('Please enter a valid UPI ID (e.g. name@upi).');
      return;
    }

    if (
      paymentMethod === 'card' &&
      (!paymentDetails.cardNumber || !paymentDetails.cardExpiry || !paymentDetails.cardCvv)
    ) {
      setPaymentError('Please complete all credit/debit card fields.');
      return;
    }

    setPaymentError('');
    setIsSubmitting(true);

    const addressData = savedAddress || getAddressValues();

    const orderPayload = {
      orderId: `ORD-IND-${Math.floor(100000 + Math.random() * 900000)}`,
      userEmail: currentUser?.email || 'customer@indicart.com',
      userName: addressData.fullName,
      items: [...cartItems],
      subtotal: totals.subtotal,
      discount: totals.couponDiscount,
      coupon: appliedCoupon?.code || null,
      tax: totals.tax,
      shipping: totals.shipping,
      total: totals.grandTotal,
      address: addressData,
      deliveryMethod: `${deliveryMethod.name} (${deliveryMethod.time})`,
      paymentMethod:
        paymentMethod === 'cod'
          ? 'Cash on Delivery'
          : paymentMethod === 'upi'
          ? `UPI (${paymentDetails.upiId})`
          : 'Credit / Debit Card',
    };

    try {
      const placedOrder = await dispatch(placeOrderThunk(orderPayload)).unwrap();
      setIsSubmitting(false);
      navigate('/order-confirmation', { state: { order: placedOrder } });
    } catch {
      setIsSubmitting(false);
      setPaymentError('Failed to process order. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout Progress Stepper Header */}
      <div className="glass-panel p-6 rounded-3xl">
        <h1 className="text-2xl font-black text-slate-900 mb-6 text-center sm:text-left tracking-tight">
          Checkout Wizard
        </h1>
        <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-3xl mx-auto">
          {[
            { num: 1, label: 'Address' },
            { num: 2, label: 'Delivery' },
            { num: 3, label: 'Payment' },
            { num: 4, label: 'Summary' },
          ].map((st) => (
            <div key={st.num} className="flex flex-col items-center text-center">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-xs sm:text-sm transition ${
                  step === st.num
                    ? 'bg-[#5B3DF5] text-white ring-4 ring-[#5B3DF5]/20 shadow-md scale-105'
                    : step > st.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200/60 text-slate-400'
                }`}
              >
                {step > st.num ? '✓' : st.num}
              </div>
              <span
                className={`text-[11px] sm:text-xs font-bold mt-2 ${
                  step === st.num ? 'text-[#5B3DF5]' : 'text-slate-500'
                }`}
              >
                {st.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Step Content Container (Left Column) */}
        <div className="lg:col-span-8 glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          {/* STEP 1 — SHIPPING ADDRESS (react-hook-form + Yup) */}
          {step === 1 && (
            <form onSubmit={handleAddressFormSubmit(onAddressValid)} className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">1. Shipping Address</h2>
                <span className="text-xs text-slate-400 italic">Validated with react-hook-form + Yup</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name *</label>
                  <input
                    type="text"
                    {...registerAddress('fullName')}
                    placeholder="Rajeev Ranjan"
                    className={`w-full px-4 py-2.5 text-sm bg-[#F8F7FC] border rounded-xl focus:bg-white font-medium text-slate-900 ${
                      addressErrors.fullName ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/80 focus:border-[#5B3DF5]'
                    }`}
                  />
                  {addressErrors.fullName && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1">{addressErrors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    {...registerAddress('phone')}
                    placeholder="9876543210"
                    className={`w-full px-4 py-2.5 text-sm bg-[#F8F7FC] border rounded-xl focus:bg-white font-medium text-slate-900 ${
                      addressErrors.phone ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/80 focus:border-[#5B3DF5]'
                    }`}
                  />
                  {addressErrors.phone && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1">{addressErrors.phone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Street Address *</label>
                <input
                  type="text"
                  {...registerAddress('address')}
                  placeholder="Flat No, Apartment, Street Name"
                  className={`w-full px-4 py-2.5 text-sm bg-[#F8F7FC] border rounded-xl focus:bg-white font-medium text-slate-900 ${
                    addressErrors.address ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/80 focus:border-[#5B3DF5]'
                  }`}
                />
                {addressErrors.address && (
                  <p className="text-[11px] font-bold text-rose-600 mt-1">{addressErrors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">City *</label>
                  <input
                    type="text"
                    {...registerAddress('city')}
                    placeholder="Mumbai"
                    className={`w-full px-4 py-2.5 text-sm bg-[#F8F7FC] border rounded-xl focus:bg-white font-medium text-slate-900 ${
                      addressErrors.city ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/80 focus:border-[#5B3DF5]'
                    }`}
                  />
                  {addressErrors.city && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1">{addressErrors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">State *</label>
                  <input
                    type="text"
                    {...registerAddress('state')}
                    placeholder="Maharashtra"
                    className={`w-full px-4 py-2.5 text-sm bg-[#F8F7FC] border rounded-xl focus:bg-white font-medium text-slate-900 ${
                      addressErrors.state ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/80 focus:border-[#5B3DF5]'
                    }`}
                  />
                  {addressErrors.state && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1">{addressErrors.state.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Postal Code (PIN) *</label>
                  <input
                    type="text"
                    maxLength={6}
                    {...registerAddress('postalCode')}
                    placeholder="400001"
                    className={`w-full px-4 py-2.5 text-sm bg-[#F8F7FC] border rounded-xl focus:bg-white font-medium text-slate-900 ${
                      addressErrors.postalCode ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200/80 focus:border-[#5B3DF5]'
                    }`}
                  />
                  {addressErrors.postalCode && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1">{addressErrors.postalCode.message}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="btn-purple-gradient py-3 px-6 rounded-full font-bold text-xs text-white shadow-md cursor-pointer hover:shadow-lg transition"
                >
                  Continue to Delivery &rarr;
                </button>
              </div>
            </form>
          )}

          {/* STEP 2 — DELIVERY OPTION */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                2. Choose Delivery Method
              </h2>

              <div className="space-y-3">
                <label
                  onClick={() => setDeliveryMethod({ id: 'standard', name: 'Standard Delivery', time: '3 - 5 Business Days', fee: null })}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                    deliveryMethod.id === 'standard' ? 'border-[#5B3DF5] bg-[#5B3DF5]/5 shadow-xs' : 'border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input type="radio" checked={deliveryMethod.id === 'standard'} readOnly className="w-4 h-4 text-[#5B3DF5]" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Standard Delivery</h4>
                      <p className="text-xs text-slate-500">Delivered within 3 - 5 Business Days</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    {totals.subtotal >= 499 ? 'FREE' : '₹50'}
                  </span>
                </label>

                <label
                  onClick={() => setDeliveryMethod({ id: 'express', name: 'Express Air Delivery', time: '1 - 2 Business Days', fee: 120 })}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                    deliveryMethod.id === 'express' ? 'border-[#5B3DF5] bg-[#5B3DF5]/5 shadow-xs' : 'border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input type="radio" checked={deliveryMethod.id === 'express'} readOnly className="w-4 h-4 text-[#5B3DF5]" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Express Air Delivery</h4>
                      <p className="text-xs text-slate-500">Priority processing, delivered within 1 - 2 days</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-900">₹120</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button variant="outline" size="md" className="rounded-full font-bold border-slate-300" onClick={() => setStep(1)}>
                  &larr; Back to Address
                </Button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-purple-gradient py-3 px-6 rounded-full font-bold text-xs text-white shadow-md cursor-pointer hover:shadow-lg transition"
                >
                  Continue to Payment &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — PAYMENT OPTION */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                3. Select Payment Option
              </h2>

              {paymentError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                  {paymentError}
                </div>
              )}

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label
                  onClick={() => { setPaymentMethod('cod'); setPaymentError(''); }}
                  className={`p-4 rounded-2xl border-2 flex items-start space-x-3 cursor-pointer transition ${
                    paymentMethod === 'cod' ? 'border-[#5B3DF5] bg-[#5B3DF5]/5 shadow-xs' : 'border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <input type="radio" checked={paymentMethod === 'cod'} readOnly className="w-4 h-4 text-[#5B3DF5] mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Cash on Delivery (COD)</h4>
                    <p className="text-xs text-slate-500">Pay cash upon receiving package at your doorstep.</p>
                  </div>
                </label>

                {/* UPI */}
                <div
                  onClick={() => { setPaymentMethod('upi'); setPaymentError(''); }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition space-y-3 ${
                    paymentMethod === 'upi' ? 'border-[#5B3DF5] bg-[#5B3DF5]/5 shadow-xs' : 'border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input type="radio" checked={paymentMethod === 'upi'} readOnly className="w-4 h-4 text-[#5B3DF5]" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">UPI Payment (GPay / PhonePe / Paytm)</h4>
                      <p className="text-xs text-slate-500">Instant UPI checkout</p>
                    </div>
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="pt-2 pl-7">
                      <input
                        type="text"
                        placeholder="Enter UPI ID (e.g. username@upi)"
                        value={paymentDetails.upiId}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                        className="w-full max-w-sm px-3.5 py-2.5 text-xs bg-white border border-slate-200/80 rounded-xl font-medium"
                      />
                    </div>
                  )}
                </div>

                {/* Credit/Debit Card */}
                <div
                  onClick={() => { setPaymentMethod('card'); setPaymentError(''); }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition space-y-3 ${
                    paymentMethod === 'card' ? 'border-[#5B3DF5] bg-[#5B3DF5]/5 shadow-xs' : 'border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input type="radio" checked={paymentMethod === 'card'} readOnly className="w-4 h-4 text-[#5B3DF5]" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Credit / Debit Card</h4>
                      <p className="text-xs text-slate-500">Visa, MasterCard, RuPay</p>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="pt-2 pl-7 space-y-2 max-w-sm">
                      <input
                        type="text"
                        placeholder="Card Number (e.g. 4111 2222 3333 4444)"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="MM / YY"
                          value={paymentDetails.cardExpiry}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium"
                        />
                        <input
                          type="password"
                          placeholder="CVV"
                          maxLength={4}
                          value={paymentDetails.cardCvv}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardCvv: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button variant="outline" size="md" className="rounded-full font-bold border-slate-300" onClick={() => setStep(2)}>
                  &larr; Back to Delivery
                </Button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="btn-purple-gradient py-3 px-6 rounded-full font-bold text-xs text-white shadow-md cursor-pointer hover:shadow-lg transition"
                >
                  Review Order &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — ORDER SUMMARY & PLACE ORDER */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                4. Final Order Summary & Review
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Address Summary */}
                <div className="p-4 bg-[#F8F7FC] rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="font-bold uppercase tracking-wider text-slate-500">Shipping Address</span>
                  <p className="font-extrabold text-slate-900">{savedAddress?.fullName || getAddressValues().fullName}</p>
                  <p className="text-slate-600">{savedAddress?.address || getAddressValues().address}</p>
                  <p className="text-slate-600">
                    {savedAddress?.city || getAddressValues().city}, {savedAddress?.state || getAddressValues().state} - {savedAddress?.postalCode || getAddressValues().postalCode}
                  </p>
                  <p className="text-slate-600">Phone: {savedAddress?.phone || getAddressValues().phone}</p>
                </div>

                {/* Delivery & Payment Summary */}
                <div className="p-4 bg-[#F8F7FC] rounded-2xl border border-slate-200/80 space-y-2">
                  <div>
                    <span className="font-bold uppercase tracking-wider text-slate-500">Delivery Method</span>
                    <p className="font-extrabold text-slate-900">{deliveryMethod.name} ({deliveryMethod.time})</p>
                  </div>
                  <div className="border-t border-slate-200 pt-2">
                    <span className="font-bold uppercase tracking-wider text-slate-500">Payment Option</span>
                    <p className="font-extrabold text-slate-900">
                      {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'upi' ? `UPI (${paymentDetails.upiId})` : 'Credit / Debit Card'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items List Summary */}
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-[#F8F7FC]">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded bg-white border border-slate-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        <ProductImage
                          src={item.thumbnail}
                          alt={item.title}
                          fallbackIconSize="w-5 h-5"
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="text-slate-500">Qty: {item.quantity} &times; {formatCurrency(item.price)}</p>
                      </div>
                    </div>
                    <span className="font-black text-slate-900">{formatCurrency(calculateItemTotal(item))}</span>
                  </div>
                ))}
              </div>

              {paymentError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                  {paymentError}
                </div>
              )}

              <div className="pt-4 flex items-center justify-between">
                <Button variant="outline" size="md" className="rounded-full font-bold border-slate-300" onClick={() => setStep(3)}>
                  &larr; Back to Payment
                </Button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="btn-purple-gradient py-3.5 px-8 rounded-full font-bold text-sm text-white shadow-lg disabled:opacity-50 transition cursor-pointer"
                >
                  {isSubmitting ? 'Processing Order...' : 'Place Order Now'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Breakdown Panel */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Price Breakdown
          </h3>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal ({totals.totalItemCount} items)</span>
              <span className="font-bold text-slate-900">{formatCurrency(totals.subtotal)}</span>
            </div>

            {totals.couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Coupon Discount ({appliedCoupon?.code})</span>
                <span>-{formatCurrency(totals.couponDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Estimated Tax (18% GST)</span>
              <span className="font-bold text-slate-900">{formatCurrency(totals.tax)}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping ({deliveryMethod.name})</span>
              <span className="font-bold text-slate-900">
                {totals.shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatCurrency(totals.shipping)}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200/80 pt-3 flex items-center justify-between">
            <span className="text-base font-black text-slate-900">Total Payable</span>
            <span className="text-xl font-black text-[#5B3DF5]">{formatCurrency(totals.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

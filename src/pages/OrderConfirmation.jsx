import React, { useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentOrder } from '../features/orders/ordersSlice';
import { formatCurrency } from '../utils/formatCurrency';
import { useAuth } from '../context/AuthContext';
import { gmailService } from '../services/gmailService';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';

const OrderConfirmation = () => {
  const location = useLocation();
  const { showToast } = useToast();
  const { currentUser, getAccessToken, loginWithGoogle } = useAuth();
  const reduxCurrentOrder = useSelector(selectCurrentOrder);
  const order = location.state?.order || reduxCurrentOrder;

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);

  if (!order) {
    return <Navigate to="/orders" replace />;
  }

  const handleSendEmailPrompt = () => {
    setShowEmailConfirmModal(true);
  };

  const handleConfirmSendEmail = async () => {
    setShowEmailConfirmModal(false);
    let token = getAccessToken();

    // If user is not logged in via Google, prompt to connect Google Account first
    if (!token) {
      const signInRes = await loginWithGoogle();
      if (!signInRes?.success) {
        showToast('Google authentication required to send email via Gmail.');
        return;
      }
      token = getAccessToken();
    }

    if (!token) {
      showToast('Could not obtain Gmail access token.');
      return;
    }

    setIsSendingEmail(true);
    try {
      const targetEmail = order.userEmail || currentUser?.email;
      await gmailService.sendOrderConfirmationEmail(token, {
        to: targetEmail,
        from: currentUser?.email || 'me',
        order,
      });
      setEmailSent(true);
      showToast(`Order confirmation receipt sent to ${targetEmail} via Gmail!`);
    } catch (err) {
      console.error('Failed to send order email:', err);
      showToast(err.message || 'Failed to send confirmation email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Confirmation Modal for Destructive/Outbound Operations */}
      {showEmailConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-3 text-slate-900">
              <div className="w-10 h-10 rounded-full bg-[#84CC16]/20 flex items-center justify-center text-[#65A30D]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-slate-900">Confirm Sending Email</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              With your permission, this app will send an HTML Order Receipt email for order{' '}
              <strong className="text-slate-900">#{order.orderId}</strong> to{' '}
              <strong className="text-slate-900">{order.userEmail || currentUser?.email}</strong> directly from your Gmail account.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEmailConfirmModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSendEmail}
                className="btn-lime-gradient px-5 py-2.5 rounded-full text-xs font-black text-[#0A0A0A] shadow cursor-pointer"
              >
                Yes, Send Receipt Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Hero Header */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 bg-lime-100 text-[#65A30D] rounded-full flex items-center justify-center text-3xl font-black mx-auto shadow-sm">
          ✓
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Order Placed Successfully!</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">
          Thank you for shopping with Indicart! Your order has been saved securely to Firebase and is being prepared.
        </p>

        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#84CC16]/10 border border-[#84CC16]/30 text-[#0A0A0A] font-black text-sm rounded-full">
          <span>Order Reference:</span>
          <span>{order.orderId}</span>
        </div>

        {/* Gmail Feature Banner */}
        <div className="pt-2 max-w-md mx-auto">
          {emailSent ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Order confirmation email sent to your Gmail inbox!</span>
            </div>
          ) : (
            <button
              type="button"
              disabled={isSendingEmail}
              onClick={handleSendEmailPrompt}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-full text-xs font-bold text-slate-800 hover:border-[#84CC16] hover:bg-lime-50 transition shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span>{isSendingEmail ? 'Sending via Gmail...' : 'Send Order Receipt to my Gmail'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Order Details Breakdown Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Order Placed On</span>
            <p className="text-sm font-bold text-slate-900">
              {order.orderDate
                ? new Date(order.orderDate).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Recently'}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Status</span>
            <span className="block px-3 py-1 bg-lime-100 text-[#0A0A0A] text-xs font-black rounded-full w-fit mt-0.5">
              {order.status || 'Processing'}
            </span>
          </div>
        </div>

        {/* Shipping & Payment Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 bg-[#F8F7FC] rounded-2xl border border-slate-200/80 space-y-1">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Delivery Address</h4>
            <p className="font-bold text-slate-900">{order.userName}</p>
            <p className="text-slate-600">{order.address?.address}</p>
            <p className="text-slate-600">
              {order.address?.city}, {order.address?.state} - {order.address?.postalCode}
            </p>
            <p className="text-slate-600">Phone: {order.address?.phone}</p>
          </div>

          <div className="p-4 bg-[#F8F7FC] rounded-2xl border border-slate-200/80 space-y-3">
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider">Delivery Method</h4>
              <p className="text-slate-700 font-semibold mt-1">{order.deliveryMethod}</p>
            </div>
            <div className="border-t border-slate-200 pt-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider">Payment Method</h4>
              <p className="text-slate-700 font-semibold mt-1">{order.paymentMethod}</p>
            </div>
          </div>
        </div>

        {/* Items Summary Table */}
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-[#F8F7FC]">
          <div className="bg-slate-100/70 px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Ordered Items ({order.items?.length || 0})
          </div>
          {order.items?.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <img src={item.thumbnail} alt={item.title} className="w-12 h-12 object-contain bg-white rounded border border-slate-200 p-1" />
                <div>
                  <p className="font-bold text-slate-900">{item.title}</p>
                  <p className="text-slate-500">{formatCurrency(item.price)} &times; {item.quantity}</p>
                </div>
              </div>
              <span className="font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Financial Breakdown */}
        <div className="bg-[#F8F7FC] p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-bold text-slate-900">{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Coupon Discount ({order.coupon})</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Estimated Tax (18% GST)</span>
            <span className="font-bold text-slate-900">{formatCurrency(order.tax)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span className="font-bold text-slate-900">
              {order.shipping === 0 ? 'FREE' : formatCurrency(order.shipping)}
            </span>
          </div>
          <div className="border-t border-slate-200/80 pt-2 flex justify-between font-black text-sm text-slate-900">
            <span>Total Paid</span>
            <span className="text-[#0A0A0A]">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/orders/${order.orderId}`}>
            <Button variant="outline" size="md" className="w-full sm:w-auto rounded-full font-bold border-slate-300">
              View Order Details
            </Button>
          </Link>
          <Link to="/products">
            <button
              type="button"
              className="w-full sm:w-auto btn-lime-gradient py-2.5 px-6 rounded-full font-black text-xs text-[#0A0A0A] shadow-md cursor-pointer"
            >
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

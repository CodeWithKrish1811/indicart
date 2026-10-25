import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { selectAllOrders } from '../features/orders/ordersSlice';
import { getStorageItem, STORAGE_KEYS } from '../utils/localStorage';
import { formatCurrency } from '../utils/formatCurrency';
import { calculateItemTotal } from '../utils/cartCalculations';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';
import ProductImage from '../components/common/ProductImage';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const reduxOrders = useSelector(selectAllOrders);

  const order = useMemo(() => {
    const foundInRedux = reduxOrders.find((o) => String(o.orderId) === String(id));
    if (foundInRedux) return foundInRedux;

    const allOrders = getStorageItem(STORAGE_KEYS.ORDERS, []);
    return allOrders.find(
      (o) =>
        String(o.orderId) === String(id) &&
        o.userEmail &&
        o.userEmail.toLowerCase() === currentUser?.email?.toLowerCase()
    );
  }, [id, reduxOrders, currentUser]);

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/orders" className="text-sm font-semibold text-indigo-600 hover:underline mb-6 inline-block">
          &larr; Back to My Orders
        </Link>
        <ErrorMessage
          title="Order Not Found"
          message={`We could not find order record "${id}" associated with your account.`}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Nav Header */}
      <div className="flex items-center justify-between">
        <Link to="/orders" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
          <span>&larr;</span>
          <span>Back to Orders</span>
        </Link>
        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
          {order.status || 'Processing'}
        </span>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Order {order.orderId}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Placed on {order.orderDate ? new Date(order.orderDate).toLocaleString('en-IN') : 'Recently'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Amount</span>
            <div className="text-xl font-black text-[#5B3DF5]">{formatCurrency(order.total)}</div>
          </div>
        </div>

        {/* Address & Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 bg-[#F8F7FC] rounded-2xl border border-slate-200/80 space-y-1">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Shipping Address</h4>
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

        {/* Items List */}
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-[#F8F7FC]">
          <div className="bg-slate-100/70 px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Items Included ({order.items?.length || 0})
          </div>
          {order.items?.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <Link to={`/products/${item.id}`} className="w-12 h-12 bg-white rounded border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <ProductImage
                    src={item.thumbnail}
                    alt={item.title}
                    fallbackIconSize="w-5 h-5"
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </Link>
                <div>
                  <Link to={`/products/${item.id}`} className="font-bold text-slate-900 hover:text-[#5B3DF5] transition">
                    {item.title}
                  </Link>
                  <p className="text-slate-500">{formatCurrency(item.price)} &times; {item.quantity}</p>
                </div>
              </div>
              <span className="font-bold text-slate-900">{formatCurrency(calculateItemTotal(item))}</span>
            </div>
          ))}
        </div>

        {/* Totals Summary */}
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
            <span>Shipping Charge</span>
            <span className="font-bold text-slate-900">
              {order.shipping === 0 ? 'FREE' : formatCurrency(order.shipping)}
            </span>
          </div>
          <div className="border-t border-slate-200/80 pt-2 flex justify-between font-black text-sm text-slate-900">
            <span>Grand Total</span>
            <span className="text-[#5B3DF5]">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="pt-4 flex justify-between items-center">
          <Button variant="outline" size="sm" className="rounded-full font-bold border-slate-300" onClick={() => navigate('/orders')}>
            &larr; Back to Orders
          </Button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="btn-purple-gradient py-2 px-5 rounded-full text-xs font-bold text-white shadow-md cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

import React, { useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { selectUserOrders, fetchFirestoreOrdersThunk } from '../features/orders/ordersSlice';
import { getStorageItem, STORAGE_KEYS } from '../utils/localStorage';
import { formatCurrency } from '../utils/formatCurrency';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import ProductImage from '../components/common/ProductImage';

const Orders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useAuth();

  const email = currentUser?.email || '';
  const reduxOrders = useSelector((state) => selectUserOrders(state, email));

  // Sync with Firestore on mount or email change
  useEffect(() => {
    if (email) {
      dispatch(fetchFirestoreOrdersThunk(email));
    }
  }, [dispatch, email]);

  const userOrders = useMemo(() => {
    if (reduxOrders && reduxOrders.length > 0) return reduxOrders;
    if (!email) return [];
    const localOrders = getStorageItem(STORAGE_KEYS.ORDERS, []);
    return localOrders.filter(
      (o) => o.userEmail && o.userEmail.toLowerCase() === email.toLowerCase()
    );
  }, [reduxOrders, email]);

  if (userOrders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          title="No orders placed yet."
          message="You haven't placed any orders with Indicart yet. Discover great products in our catalog!"
          actionText="Start Shopping"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Orders</h1>
        <p className="text-sm text-slate-500 mt-1">
          Showing {userOrders.length} {userOrders.length === 1 ? 'order' : 'orders'} placed by {currentUser?.name || 'Customer'} (Synced with Firebase)
        </p>
      </div>

      <div className="space-y-4">
        {userOrders.map((order) => {
          const itemCount = order.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0;

          return (
            <div
              key={order.orderId}
              className="glass-panel p-6 rounded-3xl space-y-4 card-hover-lift"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-[#65A30D] uppercase tracking-wider">
                      {order.orderId}
                    </span>
                    <span className="px-2.5 py-0.5 bg-lime-100 text-[#0A0A0A] text-[10px] font-black rounded-full">
                      {order.status || 'Processing'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Placed on{' '}
                    {order.orderDate
                      ? new Date(order.orderDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Recently'}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900">{formatCurrency(order.total)}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{itemCount} items</div>
                  </div>
                  <Link to={`/orders/${order.orderId}`}>
                    <Button variant="outline" size="sm" className="text-xs font-bold rounded-full border-slate-300 hover:border-[#84CC16] hover:text-[#65A30D]">
                      View Details &rarr;
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Sample Product Previews */}
              <div className="flex items-center space-x-3 overflow-x-auto py-1">
                {order.items?.slice(0, 4).map((item, idx) => (
                  <div
                    key={idx}
                    className="w-14 h-14 bg-[#F8F7FC] border border-slate-200/80 rounded-xl flex items-center justify-center shrink-0 p-1 shadow-xs overflow-hidden"
                    title={item.title}
                  >
                    <ProductImage
                      src={item.thumbnail}
                      alt={item.title}
                      fallbackIconSize="w-5 h-5"
                      className="max-h-full max-w-full object-contain drop-shadow-xs"
                      loading="lazy"
                    />
                  </div>
                ))}
                {order.items?.length > 4 && (
                  <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold text-slate-600">
                    +{order.items.length - 4} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;

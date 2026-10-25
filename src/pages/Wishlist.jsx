import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency';
import EmptyState from '../components/common/EmptyState';
import ProductImage from '../components/common/ProductImage';

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (item) => {
    addToCart(item);
    removeFromWishlist(item.id);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          title="Your wishlist is empty."
          message="Save items you love to your wishlist and revisit them anytime."
          actionText="Explore Products"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Wishlist</h1>
        <p className="text-sm text-slate-500 mt-1">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'saved item' : 'saved items'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map((item) => {
          const price = typeof item.price === 'number' ? item.price : 0;
          const inStock = item.stock === undefined ? true : item.stock > 0;

          return (
            <div
              key={item.id}
              className="glass-panel rounded-3xl flex flex-col justify-between overflow-hidden relative group card-hover-lift p-4 space-y-4"
            >
              {/* Product Thumbnail Container */}
              <div className="w-full h-48 bg-[#F8F7FC] p-4 rounded-2xl flex items-center justify-center relative border border-slate-200/80 overflow-hidden">
                <ProductImage
                  src={item.thumbnail}
                  alt={item.title}
                  fallbackText={item.brand || item.category || 'Product'}
                  fallbackIconSize="w-10 h-10"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => removeFromWishlist(item.id)}
                  aria-label="Remove from wishlist"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center shadow-xs transition cursor-pointer font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Product Info */}
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#5B3DF5]">
                    {item.brand || item.category || 'Indicart'}
                  </span>
                  <Link to={`/products/${item.id}`} className="block group-hover:text-[#5B3DF5] transition">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="mt-2 text-base font-black text-slate-900">
                    {formatCurrency(price)}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className={`text-[11px] font-bold block ${inStock ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {inStock ? 'In Stock' : 'Out of Stock'}
                  </span>

                  <button
                    type="button"
                    disabled={!inStock}
                    onClick={() => handleMoveToCart(item)}
                    className="w-full btn-purple-gradient py-2.5 px-4 rounded-full text-xs font-bold text-white shadow-xs hover:shadow-md disabled:opacity-50 transition cursor-pointer"
                  >
                    Move to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;

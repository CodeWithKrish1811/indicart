import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import ProductImage from '../common/ProductImage';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);

  const price = typeof product.price === 'number' ? product.price : 0;
  const discountPercentage = product.discountPercentage || 0;
  
  // Use normalized originalPrice if present, or compute
  const originalPriceVal = product.originalPrice || (discountPercentage > 0
    ? price / (1 - discountPercentage / 100)
    : null);

  const inStock = product.stock === undefined ? true : product.stock > 0;

  return (
    <div className="group glass-panel rounded-3xl border border-slate-200/80 hover:border-[#84CC16]/40 shadow-xs card-hover-lift flex flex-col h-full overflow-hidden relative">
      {/* Product Image Container (Soft Backdrop) */}
      <div className="relative w-full h-48 sm:h-52 bg-gradient-to-b from-slate-100/90 to-lime-50/40 flex items-center justify-center p-4 overflow-hidden border-b border-slate-100">
        <Link to={`/products/${product.id}`} className="w-full h-full flex items-center justify-center">
          <ProductImage
            src={product.thumbnail || (product.images && product.images[0]) || ''}
            alt={product.title || product.name || 'Product'}
            fallbackText={product.category || 'Product'}
            fallbackIconSize="w-12 h-12"
            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
            loading="lazy"
          />
        </Link>

        {/* Badges (Vibrant Lime Highlight Pill) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
          {discountPercentage > 0 && (
            <span className="px-2.5 py-1 bg-[#84CC16] text-[#0A0A0A] font-black text-[10px] rounded-full shadow-xs uppercase tracking-wider">
              {Math.round(discountPercentage)}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button (Circular Glass Button) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md hover:bg-white flex items-center justify-center text-slate-700 hover:text-rose-600 shadow-sm border border-white/60 transition duration-200 cursor-pointer"
        >
          <svg
            className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'fill-none'}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Product Info Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 min-w-0">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-black text-[#65A30D] uppercase tracking-wider truncate">{product.brand || product.category || 'Indicart'}</span>
            <span className={`font-semibold shrink-0 ml-1 ${inStock ? 'text-emerald-600' : 'text-rose-500'}`}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <Link to={`/products/${product.id}`} className="block group-hover:text-[#65A30D] transition min-h-[2.6rem]">
            <h3 className="text-xs sm:text-sm font-bold text-[#0A0A0A] line-clamp-2 leading-snug">
              {product.title || product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center space-x-1 pt-0.5">
            <div className="flex items-center text-amber-400">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[11px] font-bold text-slate-800 ml-1">{product.rating ? Number(product.rating).toFixed(1) : '4.5'}</span>
            </div>
            {product.reviews && product.reviews.length > 0 && (
              <span className="text-[10px] text-slate-400 font-medium">({product.reviews.length})</span>
            )}
          </div>
        </div>

        {/* Product Card Footer */}
        <div className="product-card-footer pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 mt-auto">
          {/* LEFT: Price Area (Current price on top, Original price below) */}
          <div className="price-container flex flex-col justify-center min-w-0">
            <span className="text-sm sm:text-base font-black text-[#0A0A0A] leading-tight">
              {formatCurrency(price)}
            </span>
            {originalPriceVal && (
              <span className="text-[11px] text-neutral-400 line-through font-medium leading-tight mt-0.5">
                {formatCurrency(originalPriceVal)}
              </span>
            )}
          </div>

          {/* RIGHT: Compact Add to Cart Button (Static document flow, zero overlap) */}
          <button
            type="button"
            disabled={!inStock}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
            }}
            className="add-to-cart-button shrink-0 px-3.5 py-1.5 btn-lime-gradient text-[11px] font-black rounded-full shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-center uppercase hover:scale-105 active:scale-95 transition-all ml-auto"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

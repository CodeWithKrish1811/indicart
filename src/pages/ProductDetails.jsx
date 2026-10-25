import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useGetProductByIdQuery,
  useGetProductsByCategoryQuery,
} from '../features/products/productsApi';
import {
  getCategoryDisplayLabel,
  CATEGORY_MAP,
} from '../features/products/productFilters';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import ProductCard from '../components/product/ProductCard';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { formatCurrency } from '../utils/formatCurrency';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

import ProductImage from '../components/common/ProductImage';

const ProductDetails = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const { data: product, isLoading, isError, error, refetch } = useGetProductByIdQuery(id);

  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Category & Related Products Query
  const categorySlug = product?.category ? product.category.toLowerCase() : '';
  const relatedCategoryQuery = useGetProductsByCategoryQuery(
    { category: categorySlug, limit: 12 },
    { skip: !categorySlug }
  );

  const relatedProducts = React.useMemo(() => {
    const rawList = relatedCategoryQuery.data?.products || [];
    return rawList.filter((p) => String(p.id) !== String(id)).slice(0, 4);
  }, [relatedCategoryQuery.data, id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-8 rounded-2xl border border-slate-200">
          <div className="lg:col-span-6 h-96 bg-slate-200 rounded-2xl" />
          <div className="lg:col-span-6 space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-24 bg-slate-200 rounded w-full" />
            <div className="h-12 bg-slate-200 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/products" className="text-sm font-semibold text-indigo-600 hover:underline mb-6 inline-block">
          &larr; Back to Products
        </Link>
        <ErrorMessage
          title="Product Not Found"
          message={error?.data?.message || `Unable to load details for product with ID "${id}".`}
          onRetry={refetch}
        />
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);

  // Gallery calculation
  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail];
  const activeImage = selectedImage || product.thumbnail || images[0] || '';

  // Price calculations
  const price = typeof product.price === 'number' ? product.price : 0;
  const discountPercentage = product.discountPercentage || 0;
  const originalPriceVal = product.originalPrice || (discountPercentage > 0 ? price / (1 - discountPercentage / 100) : null);

  // Stock Calculation & Status
  const stock = product.stock !== undefined ? product.stock : 10;
  const inStock = stock > 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleDecreaseQuantity = () => {
    if (quantity <= 1) return;
    setQuantity((q) => q - 1);
  };

  const handleIncreaseQuantity = () => {
    if (quantity >= stock) {
      showToast(`Maximum available stock limit of ${stock} reached.`);
      return;
    }
    setQuantity((q) => q + 1);
  };

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart(product, quantity);
  };

  // Find user-facing customer category slug for breadcrumb
  let parentCategorySlug = '';
  Object.keys(CATEGORY_MAP).forEach((key) => {
    if (CATEGORY_MAP[key].includes(categorySlug)) {
      parentCategorySlug = key;
    }
  });
  if (!parentCategorySlug) parentCategorySlug = categorySlug;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. BREADCRUMBS */}
      <nav aria-label="Breadcrumb" className="text-xs font-semibold text-slate-500 flex items-center space-x-2 flex-wrap">
        <Link to="/" className="hover:text-indigo-600 transition">
          Home
        </Link>
        <span>/</span>
        <Link
          to={`/products?category=${encodeURIComponent(parentCategorySlug)}`}
          className="hover:text-indigo-600 transition capitalize"
        >
          {getCategoryDisplayLabel(parentCategorySlug)}
        </Link>
        <span>/</span>
        <span className="text-slate-900 truncate max-w-xs sm:max-w-md font-bold">
          {product.title}
        </span>
      </nav>

      {/* 2. MAIN PRODUCT DETAILS CONTAINER */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Large Image */}
          <div className="w-full h-80 sm:h-96 bg-[#F8F7FC] rounded-2xl border border-slate-200/80 flex items-center justify-center p-6 overflow-hidden relative shadow-inner">
            <ProductImage
              src={activeImage}
              alt={product.title}
              fallbackText={product.title}
              fallbackIconSize="w-16 h-16"
              className="max-h-full max-w-full object-contain drop-shadow-sm"
              loading="eager"
            />

            {discountPercentage > 0 && (
              <div className="absolute top-4 left-4 pointer-events-none">
                <span className="px-3 py-1 bg-[#F4D44D] text-slate-900 text-xs font-black rounded-full shadow-sm uppercase tracking-wide">
                  {Math.round(discountPercentage)}% OFF
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl border-2 p-1.5 bg-[#F8F7FC] flex items-center justify-center shrink-0 transition cursor-pointer overflow-hidden ${
                    activeImage === img
                      ? 'border-[#84CC16] ring-2 ring-[#84CC16]/30 scale-105'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <ProductImage
                    src={img}
                    alt={`${product.title} view ${idx + 1}`}
                    fallbackIconSize="w-6 h-6"
                    className="max-h-full max-w-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Information */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge color="indigo" size="sm" className="capitalize font-bold bg-[#5B3DF5]/10 text-[#5B3DF5] border-[#5B3DF5]/20">{product.category}</Badge>
              {product.brand && <Badge color="slate" size="sm" className="font-semibold">{product.brand}</Badge>}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug tracking-tight">
              {product.title}
            </h1>

            {/* Rating Summary */}
            <div className="flex items-center space-x-2 mt-3 text-sm">
              <div className="flex items-center text-amber-400">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold text-slate-800 ml-1">{product.rating ? Number(product.rating).toFixed(1) : '4.5'}</span>
              </div>
              <span className="text-slate-400 font-medium">
                ({product.reviews?.length || 0} customer reviews)
              </span>
            </div>
          </div>

          {/* Pricing & Stock Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F7FC] border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-black text-slate-900">{formatCurrency(price)}</span>
                {originalPriceVal && (
                  <span className="text-base text-slate-400 line-through">{formatCurrency(originalPriceVal)}</span>
                )}
              </div>
              {discountPercentage > 0 && (
                <span className="text-xs font-extrabold text-purple-700 mt-1 inline-block">
                  Save {Math.round(discountPercentage)}% instantly
                </span>
              )}
            </div>

            {/* Stock Status Badge */}
            <div>
              {!inStock ? (
                <Badge color="rose" size="md" className="font-bold">
                  Out of Stock
                </Badge>
              ) : isLowStock ? (
                <Badge color="amber" size="md" className="font-bold">
                  Low Stock ({stock} left!)
                </Badge>
              ) : (
                <Badge color="emerald" size="md" className="font-bold">
                  In Stock ({stock} available)
                </Badge>
              )}
            </div>
          </div>

          {/* Quantity Selector & CTAs */}
          {inStock && (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Quantity
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-[#F8F7FC]">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={handleDecreaseQuantity}
                    className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-200 disabled:opacity-40 font-bold transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= stock}
                    onClick={handleIncreaseQuantity}
                    className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-200 disabled:opacity-40 font-bold transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {stock} items available in stock
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={!inStock}
              onClick={handleAddToCart}
              className="flex-1 btn-lime-gradient py-3.5 px-6 rounded-full font-black text-sm text-[#0A0A0A] uppercase tracking-wider shadow-md hover:shadow-lg disabled:opacity-50 transition cursor-pointer"
            >
              Add to Cart ({quantity})
            </button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1 font-bold rounded-full border-slate-300 hover:bg-lime-50 hover:text-[#65A30D] hover:border-[#84CC16]"
              onClick={() => toggleWishlist(product)}
            >
              {isWishlisted ? '♥ Remove from Wishlist' : '♡ Add to Wishlist'}
            </Button>
          </div>

          {/* Description */}
          <div className="border-t border-slate-100 pt-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Product Specifications */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Specifications</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div><span className="font-semibold text-slate-800">SKU:</span> {product.sku || `SKU-${product.id}`}</div>
              <div><span className="font-semibold text-slate-800">Weight:</span> {product.weight ? `${product.weight}g` : 'Standard'}</div>
              <div><span className="font-semibold text-slate-800">Warranty:</span> {product.warrantyInformation || '1 Year Manufacturer Warranty'}</div>
              <div><span className="font-semibold text-slate-800">Return Policy:</span> {product.returnPolicy || '30-Day Policy'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PRODUCT REVIEWS & REVIEWS SUMMARY */}
      <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-200/60 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Customer Reviews & Ratings</h2>
        </div>

        {/* Review Summary Top Banner */}
        <div className="bg-[#F8F7FC] p-6 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-black text-slate-900">
              {product.rating ? Number(product.rating).toFixed(1) : '4.5'}
            </div>
            <div>
              <div className="flex items-center text-amber-400 space-x-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Based on {product.reviews?.length || 0} customer reviews
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 italic">
            All reviews are from verified purchasers.
          </div>
        </div>

        {/* Individual Reviews List or Clean Empty State */}
        {product.reviews && product.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.reviews.map((rev, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{rev.reviewerName || 'Customer'}</span>
                  <span className="text-amber-500 font-semibold">★ {rev.rating}/5</span>
                </div>
                <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>
                <div className="text-[10px] text-slate-400">
                  {rev.date ? new Date(rev.date).toLocaleDateString() : 'Verified Purchase'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No reviews available yet."
            message="Be the first customer to purchase and share feedback for this product!"
          />
        )}
      </section>

      {/* 4. RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900">Related Products</h2>
            <Link
              to={`/products?category=${encodeURIComponent(parentCategorySlug)}`}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              View More &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;

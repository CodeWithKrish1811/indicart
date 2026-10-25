import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { getCategoryDisplayLabel } from '../../features/products/productFilters';

const ActiveFilters = ({ filterParams = {}, onFilterChange, onClearFilters }) => {
  const { search, category, brand = [], minPrice, maxPrice, rating } = filterParams;

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(category) ||
    brand.length > 0 ||
    minPrice !== null ||
    maxPrice !== null ||
    rating !== null;

  if (!hasActiveFilters) return null;

  const handleRemoveSearch = () => {
    onFilterChange({ ...filterParams, search: '', page: 1 });
  };

  const handleRemoveCategory = () => {
    onFilterChange({ ...filterParams, category: '', page: 1 });
  };

  const handleRemoveBrand = (brandToRemove) => {
    const updatedBrands = brand.filter((b) => b !== brandToRemove);
    onFilterChange({ ...filterParams, brand: updatedBrands, page: 1 });
  };

  const handleRemovePrice = () => {
    onFilterChange({ ...filterParams, minPrice: null, maxPrice: null, page: 1 });
  };

  const handleRemoveRating = () => {
    onFilterChange({ ...filterParams, rating: null, page: 1 });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Active Filters:</span>

      {/* Search Chip */}
      {search && (
        <span className="inline-flex items-center space-x-1 text-xs font-bold bg-[#84CC16]/15 text-[#365314] border border-[#84CC16]/40 px-3 py-1 rounded-full shadow-xs">
          <span>Search: &ldquo;{search}&rdquo;</span>
          <button
            type="button"
            onClick={handleRemoveSearch}
            className="hover:text-black ml-1 font-extrabold cursor-pointer"
            aria-label="Remove search filter"
          >
            &times;
          </button>
        </span>
      )}

      {/* Category Chip */}
      {category && (
        <span className="inline-flex items-center space-x-1 text-xs font-bold bg-[#5B3DF5]/10 text-[#5B3DF5] border border-[#5B3DF5]/30 px-3 py-1 rounded-full shadow-xs">
          <span>Cat: {getCategoryDisplayLabel(category)}</span>
          <button
            type="button"
            onClick={handleRemoveCategory}
            className="hover:text-purple-900 ml-1 font-extrabold cursor-pointer"
            aria-label="Remove category filter"
          >
            &times;
          </button>
        </span>
      )}

      {/* Brand Chips */}
      {brand.map((b, idx) => (
        <span
          key={idx}
          className="inline-flex items-center space-x-1 text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1 rounded-full shadow-xs"
        >
          <span>Brand: {b}</span>
          <button
            type="button"
            onClick={() => handleRemoveBrand(b)}
            className="hover:text-violet-900 ml-1 font-extrabold cursor-pointer"
            aria-label={`Remove ${b} brand filter`}
          >
            &times;
          </button>
        </span>
      ))}

      {/* Price Chip (Rupee ₹ Format) */}
      {(minPrice !== null || maxPrice !== null) && (
        <span className="inline-flex items-center space-x-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full shadow-xs">
          <span>
            Price: {minPrice !== null ? formatCurrency(minPrice) : '₹0'} - {maxPrice !== null ? formatCurrency(maxPrice) : '∞'}
          </span>
          <button
            type="button"
            onClick={handleRemovePrice}
            className="hover:text-emerald-900 ml-1 font-extrabold cursor-pointer"
            aria-label="Remove price range filter"
          >
            &times;
          </button>
        </span>
      )}

      {/* Rating Chip */}
      {rating !== null && (
        <span className="inline-flex items-center space-x-1 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full shadow-xs">
          <span>Rating: {rating}★ & above</span>
          <button
            type="button"
            onClick={handleRemoveRating}
            className="hover:text-amber-950 ml-1 font-extrabold cursor-pointer"
            aria-label="Remove rating filter"
          >
            &times;
          </button>
        </span>
      )}

      {/* Clear All Link */}
      <button
        type="button"
        onClick={onClearFilters}
        className="text-xs font-extrabold text-rose-600 hover:text-rose-700 hover:underline ml-2 transition cursor-pointer"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default ActiveFilters;

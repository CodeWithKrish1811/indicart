import React from 'react';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Featured / Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Customer Rating: High to Low' },
  { value: 'newest', label: 'Newest Arrivals' },
];

const ProductSort = ({ currentSort = 'relevance', onSortChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="product-sort-select" className="text-xs font-semibold text-slate-500 shrink-0">
        Sort By:
      </label>
      <select
        id="product-sort-select"
        aria-label="Sort products"
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
        className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16]/30 cursor-pointer shadow-xs transition"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProductSort;

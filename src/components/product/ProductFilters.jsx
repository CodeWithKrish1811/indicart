import React, { useState } from 'react';
import {
  countActiveFilters,
  CUSTOMER_FACING_CATEGORIES,
} from '../../features/products/productFilters';

const ProductFilters = ({
  filterParams = {},
  availableBrands = [],
  onFilterChange,
  onClearFilters,
  isMobile = false,
  onCloseMobile,
}) => {
  // Strict customer-facing categories list (Bug 1 Fix)
  const categoriesList = CUSTOMER_FACING_CATEGORIES;

  const targetMin = filterParams.minPrice !== null && filterParams.minPrice !== undefined ? filterParams.minPrice : '';
  const targetMax = filterParams.maxPrice !== null && filterParams.maxPrice !== undefined ? filterParams.maxPrice : '';

  const [prevMinPrice, setPrevMinPrice] = useState(targetMin);
  const [prevMaxPrice, setPrevMaxPrice] = useState(targetMax);
  const [minPriceInput, setMinPriceInput] = useState(targetMin);
  const [maxPriceInput, setMaxPriceInput] = useState(targetMax);

  if (prevMinPrice !== targetMin || prevMaxPrice !== targetMax) {
    setPrevMinPrice(targetMin);
    setPrevMaxPrice(targetMax);
    setMinPriceInput(targetMin);
    setMaxPriceInput(targetMax);
  }

  const activeCount = countActiveFilters(filterParams);

  const handleCategorySelect = (slug) => {
    const newCategory = filterParams.category === slug ? '' : slug;
    onFilterChange({
      ...filterParams,
      category: newCategory,
      page: 1,
    });
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  const handleBrandToggle = (brandName) => {
    const currentBrands = filterParams.brand || [];
    let updatedBrands;
    if (currentBrands.includes(brandName)) {
      updatedBrands = currentBrands.filter((b) => b !== brandName);
    } else {
      updatedBrands = [...currentBrands, brandName];
    }
    onFilterChange({
      ...filterParams,
      brand: updatedBrands,
      page: 1,
    });
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const minVal = minPriceInput !== '' && !isNaN(minPriceInput) ? parseFloat(minPriceInput) : null;
    const maxVal = maxPriceInput !== '' && !isNaN(maxPriceInput) ? parseFloat(maxPriceInput) : null;
    onFilterChange({
      ...filterParams,
      minPrice: minVal,
      maxPrice: maxVal,
      page: 1,
    });
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  const handleRatingSelect = (ratingVal) => {
    onFilterChange({
      ...filterParams,
      rating: filterParams.rating === ratingVal ? null : ratingVal,
      page: 1,
    });
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 text-slate-800">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-extrabold text-[#0A0A0A]">Filters</h3>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-[#84CC16] text-[#0A0A0A] text-[11px] font-black rounded-full">
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => {
              onClearFilters();
              if (isMobile && onCloseMobile) onCloseMobile();
            }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
          >
            Clear All
          </button>
        )}
      </div>

      {/* 1. Category Filter Section */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Categories</h4>
        <div className="space-y-1.5 max-h-72 sm:max-h-80 overflow-y-auto pr-1 text-xs sm:text-sm scrollbar-thin">
          {categoriesList.map((cat, idx) => {
            const isSelected =
              (!filterParams.category && !cat.slug) ||
              filterParams.category?.toLowerCase() === cat.slug.toLowerCase();
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleCategorySelect(cat.slug)}
                className={`w-full text-left px-3.5 py-2 rounded-full text-xs font-semibold transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#84CC16] text-[#0A0A0A] font-black shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80'
                }`}
              >
                <span className="capitalize truncate pr-2">{cat.name}</span>
                {isSelected && <span className="text-xs font-black">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Brand Filter Section */}
      {availableBrands.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Brand</h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
            {availableBrands.map((brandName, idx) => {
              const checked = filterParams.brand?.includes(brandName) || false;
              return (
                <label key={idx} className="flex items-center space-x-2 cursor-pointer py-1 px-2 rounded-xl hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleBrandToggle(brandName)}
                    className="w-4 h-4 rounded text-[#84CC16] focus:ring-[#84CC16] border-slate-300"
                  />
                  <span className={`text-slate-700 truncate ${checked ? 'font-bold text-[#0A0A0A]' : ''}`}>
                    {brandName}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Price Range Filter Section */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Price Range (₹)</h4>
        <form onSubmit={handlePriceApply} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min (₹)"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16]/20"
            />
            <input
              type="number"
              min="0"
              placeholder="Max (₹)"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16]/20"
            />
          </div>
          <button type="submit" className="w-full btn-lime-gradient text-xs py-2 rounded-full font-black uppercase tracking-wider shadow-xs text-[#0A0A0A]">
            Apply Price Range
          </button>
        </form>
      </div>

      {/* 4. Rating Filter Section */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer Rating</h4>
        <div className="space-y-1 text-xs">
          {[4, 3, 2, 1].map((stars) => {
            const isSelected = filterParams.rating === stars;
            return (
              <button
                key={stars}
                type="button"
                onClick={() => handleRatingSelect(stars)}
                className={`w-full text-left px-3 py-1.5 rounded-xl flex items-center justify-between transition ${
                  isSelected ? 'bg-lime-50 font-bold text-[#65A30D]' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-1 text-amber-400">
                  <span>★</span>
                  <span className="text-slate-800 font-semibold">{stars} & above</span>
                </div>
                {isSelected && <span className="text-[#65A30D] font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;

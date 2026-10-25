import React, { useState, useRef, useEffect } from 'react';

/**
 * FilterDropdown: A sleek floating select/dropdown specifically for filtering products by category
 */
const FilterDropdown = ({
  selectedCategory = '',
  onSelectCategory,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const categories = [
    { label: 'All Categories', slug: '', icon: '🏷️' },
    { label: 'Electronics', slug: 'electronics', icon: '⚡' },
    { label: 'Fashion & Apparel', slug: 'fashion', icon: '👗' },
    { label: 'Home & Living', slug: 'home-living', icon: '🛋️' },
    { label: 'Beauty & Fragrance', slug: 'beauty', icon: '✨' },
    { label: 'Sports & Active', slug: 'sports', icon: '🏃' },
    { label: 'Books & Stationeries', slug: 'books', icon: '📚' },
    { label: 'Deals & Offers', slug: 'deals', icon: '🔥' },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedSelected = (selectedCategory || '').toLowerCase().trim();
  const activeItem =
    categories.find((c) => c.slug.toLowerCase() === normalizedSelected) || categories[0];

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 hover:border-[#84CC16] shadow-xs text-slate-800 text-xs font-bold transition-all cursor-pointer group"
      >
        <span className="text-slate-400 font-medium">Category:</span>
        <span className="font-extrabold text-slate-900 flex items-center space-x-1.5">
          <span>{activeItem.icon}</span>
          <span>{activeItem.label}</span>
        </span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#84CC16] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:left-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in duration-100">
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Select Category Filter
          </div>
          {categories.map((cat) => {
            const isSelected = cat.slug.toLowerCase() === normalizedSelected;
            return (
              <button
                key={cat.slug || 'all'}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onSelectCategory(cat.slug);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-lime-50 text-[#65A30D] font-extrabold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </span>
                {isSelected && (
                  <svg className="w-4 h-4 text-[#84CC16]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;

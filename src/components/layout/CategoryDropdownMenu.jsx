import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CategoryDropdownMenu = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const currentLocationKey = location.pathname + location.search;
  const [prevLocationKey, setPrevLocationKey] = useState(currentLocationKey);

  if (prevLocationKey !== currentLocationKey) {
    setPrevLocationKey(currentLocationKey);
    setIsOpen(false);
  }

  const searchParams = new URLSearchParams(location.search);
  const currentCategory = location.pathname === '/products' ? (searchParams.get('category') || '') : null;

  // Rich metadata for the dropdown items
  const categoryItems = [
    {
      label: 'All Products',
      slug: '',
      description: 'Explore full store catalog & all collections',
      badge: 'All',
      icon: (
        <svg className="w-5 h-5 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: 'Electronics',
      slug: 'electronics',
      description: 'Smartphones, laptops, audio & tech accessories',
      badge: 'Popular',
      icon: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Fashion',
      slug: 'fashion',
      description: 'Men & women apparel, footwear, watches & bags',
      badge: 'Trending',
      icon: (
        <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      label: 'Home Decor',
      slug: 'home-living',
      description: 'Home decoration, furniture & kitchen essentials',
      badge: 'Cozy',
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'Beauty',
      slug: 'beauty',
      description: 'Skincare, fragrances, cosmetics & wellness',
      badge: 'Self-Care',
      icon: (
        <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      label: 'Sports',
      slug: 'sports',
      description: 'Sports accessories, motor & active outdoor lifestyle',
      badge: 'Active',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: 'Deals & Offers',
      slug: 'deals',
      description: 'Items with instant discounts of 10% or more',
      badge: 'Hot Deal',
      icon: (
        <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
  ];

  // Mouse hover handlers with slight debounce for delightful desktop experience
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSelect = (slug) => {
    setIsOpen(false);
    if (!slug) {
      navigate('/products');
    } else {
      navigate(`/products?category=${encodeURIComponent(slug)}`);
    }
  };

  // Find active label for the button
  const currentActive = categoryItems.find(
    (item) => item.slug === currentCategory
  );
  const activeLabel = currentActive ? currentActive.label : 'Categories';

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Categories Dropdown Trigger Button with Enhanced Hover Effects */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`group relative flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all duration-300 ease-out cursor-pointer select-none overflow-hidden ${
          isOpen
            ? 'bg-neutral-800 text-[#A6E527] border-[#84CC16] shadow-[0_0_20px_-3px_rgba(132,204,22,0.45)] -translate-y-0.5'
            : 'bg-neutral-900/90 text-white border-neutral-700/80 hover:bg-neutral-800 hover:border-[#84CC16] hover:text-[#A6E527] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgba(132,204,22,0.35)] active:translate-y-0 active:scale-98'
        }`}
      >
        {/* Subtle background glow on hover */}
        <span className="absolute inset-0 bg-gradient-to-r from-[#84CC16]/0 via-[#84CC16]/10 to-[#84CC16]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <span className="flex items-center space-x-2 relative z-10">
          {/* Animated Category Icon */}
          <span className="w-5 h-5 rounded-lg bg-neutral-800 group-hover:bg-[#84CC16]/20 flex items-center justify-center transition-colors duration-200">
            <svg
              className={`w-3.5 h-3.5 text-[#84CC16] transition-transform duration-300 ${
                isOpen ? 'rotate-90 scale-110' : 'group-hover:scale-115'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </span>

          <span className="truncate max-w-[120px] sm:max-w-[140px] group-hover:tracking-wider transition-all duration-200">
            {activeLabel}
          </span>
        </span>

        {/* Chevron with flip/spin hover */}
        <svg
          className={`w-3.5 h-3.5 text-neutral-400 group-hover:text-[#84CC16] transition-transform duration-300 relative z-10 ${
            isOpen ? 'rotate-180 text-[#84CC16]' : 'group-hover:translate-y-0.5'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Floating Panel */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0D0D0D]/95 backdrop-blur-2xl border border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden ring-1 ring-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-neutral-800/80 bg-neutral-950/70 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#84CC16] flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#84CC16] animate-pulse" />
              <span>Filter by Category</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-medium">
              Click to browse
            </span>
          </div>

          {/* List of categories */}
          <div className="p-2 space-y-1 max-h-[420px] overflow-y-auto scrollbar-thin">
            {categoryItems.map((item) => {
              const isSelected = item.slug === currentCategory;

              return (
                <button
                  key={item.slug || 'all'}
                  type="button"
                  onClick={() => handleSelect(item.slug)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer group ${
                    isSelected
                      ? 'bg-[#84CC16]/15 border border-[#84CC16]/40 text-white'
                      : 'hover:bg-neutral-800/90 text-neutral-200 hover:text-white border border-transparent hover:translate-x-1 hover:border-neutral-700/60'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#84CC16]/20 border-[#84CC16]/50 text-[#84CC16] scale-105'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 group-hover:border-[#84CC16]/40 group-hover:text-white group-hover:scale-105 group-hover:bg-neutral-800'
                      }`}
                    >
                      {item.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-bold truncate transition-colors ${isSelected ? 'text-[#84CC16]' : 'text-white group-hover:text-[#A6E527]'}`}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full transition-colors ${
                              isSelected
                                ? 'bg-[#84CC16] text-[#0A0A0A]'
                                : 'bg-neutral-800 text-neutral-400 group-hover:bg-[#84CC16]/20 group-hover:text-[#A6E527]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5 font-medium group-hover:text-neutral-300">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-[#84CC16] ml-2 shadow-[0_0_8px_#84CC16]" />
                  ) : (
                    <span className="opacity-0 group-hover:opacity-100 text-neutral-400 group-hover:text-[#84CC16] transition-all text-xs font-bold transform -translate-x-1 group-hover:translate-x-0">
                      &rarr;
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer quick action */}
          <div className="p-2 border-t border-neutral-800/80 bg-neutral-950/50">
            <button
              type="button"
              onClick={() => handleSelect('')}
              className="w-full text-center py-2 text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 hover:text-[#84CC16] transition-colors duration-150 cursor-pointer"
            >
              Browse All Products &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdownMenu;

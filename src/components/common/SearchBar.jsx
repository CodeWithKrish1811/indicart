import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

const SearchBar = ({ className = '', placeholder = 'Search products...' }) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const initialQuery = (searchParams.get('search') || searchParams.get('q') || '').trim();
  const [prevQuery, setPrevQuery] = useState(initialQuery);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const navigate = useNavigate();

  // Keep search input synchronized with URL search parameter
  if (prevQuery !== initialQuery) {
    setPrevQuery(initialQuery);
    setSearchTerm(initialQuery);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();

    // Prevent redundant request/navigation if query has not changed
    if (location.pathname === '/products' && trimmed.toLowerCase() === initialQuery.toLowerCase()) {
      return;
    }

    if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      // Empty query submission cleanly clears the search parameter
      navigate('/products');
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    // If active search query exists in the URL, clear it
    if (location.pathname === '/products' && initialQuery) {
      navigate('/products');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`relative flex items-center w-full min-w-0 ${className}`}
    >
      <div className="relative w-full flex items-center min-w-0">
        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-neutral-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          type="search"
          name="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          aria-label="Search catalog products"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className="w-full pl-9 sm:pl-10 pr-20 py-2 bg-[#1A1A1A] border border-neutral-700/80 rounded-full text-xs text-white placeholder-neutral-400 focus:outline-none focus:bg-[#222222] focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16]/40 transition-all duration-200 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-16 text-neutral-400 hover:text-white p-1 transition cursor-pointer"
            aria-label="Clear search"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <button
          type="submit"
          className="absolute right-1 px-3 py-1 btn-lime-gradient text-[11px] font-black uppercase tracking-wider rounded-full shadow-sm cursor-pointer"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;

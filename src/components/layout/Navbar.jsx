import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchBar from '../common/SearchBar';
import BrandLogo from '../common/BrandLogo';
import CategoryDropdownMenu from './CategoryDropdownMenu';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { currentUser, isAuthenticated, logout } = useAuth();
  const { totalItemCount } = useCart();
  const { wishlistCount } = useWishlist();

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    navigate('/');
  };

  const searchParams = new URLSearchParams(location.search);
  const currentCategorySlug = location.pathname === '/products' ? (searchParams.get('category') || '') : null;
  const isHomeActive = location.pathname === '/' && !location.search;

  // Direct categories with labels requested: Electronics, Fashion, Home Decor
  const quickLinks = [
    { label: 'HOME', path: '/', slug: null, isHome: true },
    { label: 'ELECTRONICS', path: '/products?category=electronics', slug: 'electronics' },
    { label: 'FASHION', path: '/products?category=fashion', slug: 'fashion' },
    { label: 'HOME DECOR', path: '/products?category=home-living', slug: 'home-living' },
    { label: 'DEALS', path: '/products?category=deals', slug: 'deals' },
  ];

  return (
    <header className="bg-[#000000] text-white border-b border-neutral-800 sticky top-0 z-50 shadow-lg w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Navbar Bar */}
        <div className="flex items-center justify-between h-20 gap-3 sm:gap-4 md:gap-6 w-full">
          
          {/* 1. FAR LEFT: Custom Font Logo "Indi मार्ट", Dropdown & Mobile Trigger */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Mobile Category Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Mobile Menu"
              className="lg:hidden p-2 text-white hover:text-[#84CC16] focus:outline-none cursor-pointer transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Logo */}
            <BrandLogo size="md" />

            {/* Category Dropdown Menu in Navbar Header */}
            <div className="hidden sm:block ml-2">
              <CategoryDropdownMenu />
            </div>
          </div>

          {/* 2. MIDDLE: Quick Category Navigation Links with Modern Hover Pills */}
          <nav className="hidden lg:flex items-center space-x-1.5 xl:space-x-2 text-[11px] xl:text-xs font-black tracking-wider uppercase shrink min-w-0">
            {quickLinks.map((cat, idx) => {
              const isCatActive = cat.isHome
                ? isHomeActive
                : currentCategorySlug !== null && currentCategorySlug === cat.slug;

              return (
                <Link
                  key={idx}
                  to={cat.path}
                  className={`relative px-3 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer group ${
                    isCatActive
                      ? 'text-[#0A0A0A] bg-[#84CC16] font-black shadow-[0_4px_14px_rgba(132,204,22,0.4)]'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/80 hover:-translate-y-0.5'
                  }`}
                >
                  <span className="relative z-10">{cat.label}</span>
                  {!isCatActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#84CC16] group-hover:w-3/4 transition-all duration-200 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3. SEARCH BAR */}
          <div className="hidden md:block flex-1 min-w-[140px] max-w-[280px] lg:max-w-[320px]">
            <SearchBar placeholder="Search products..." />
          </div>

          {/* 4. FAR RIGHT ACTIONS (Wishlist, Cart, User) */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            
            {/* Mobile Search Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden text-white hover:text-[#84CC16] p-1.5 transition cursor-pointer hover:bg-neutral-900 rounded-lg"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              aria-label="View Wishlist"
              className="relative text-white hover:text-[#84CC16] hover:bg-neutral-900 rounded-xl transition p-2 shrink-0 group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#84CC16] text-[#000000] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              aria-label="View Shopping Cart"
              className="relative text-white hover:text-[#84CC16] hover:bg-neutral-900 rounded-xl transition p-2 shrink-0 group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#84CC16] text-[#000000] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalItemCount}
                </span>
              )}
            </Link>

            {/* User Account Controls */}
            <div className="relative shrink-0">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-1 text-white hover:text-[#84CC16] hover:bg-neutral-900 rounded-xl transition cursor-pointer p-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-[#121212] text-white rounded-xl shadow-2xl border border-neutral-800 py-2 z-50">
                      <div className="px-4 py-2 border-b border-neutral-800">
                        <p className="text-xs font-bold truncate text-white">{currentUser?.name}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{currentUser?.email}</p>
                      </div>
                      <Link
                        to="/orders"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-semibold hover:bg-neutral-800 text-neutral-200"
                      >
                        My Orders
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-950/40 cursor-pointer"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  aria-label="User Account"
                  className="text-white hover:text-[#84CC16] hover:bg-neutral-900 rounded-xl transition p-2 block"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Expanded Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden pb-3">
            <SearchBar />
          </div>
        )}
      </div>

      {/* Mobile Drawer Navigation with Category Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0A0A0A] border-t border-neutral-800 px-6 py-6 space-y-4 text-white shadow-2xl">
          <div className="pb-3 border-b border-neutral-800">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#84CC16] mb-2">Category Dropdown</div>
            <CategoryDropdownMenu className="w-full" />
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Quick Categories</div>
            {[
              { label: 'All Products', path: '/products' },
              { label: 'Electronics', path: '/products?category=electronics' },
              { label: 'Fashion', path: '/products?category=fashion' },
              { label: 'Home Decor', path: '/products?category=home-living' },
              { label: 'Beauty', path: '/products?category=beauty' },
              { label: 'Sports', path: '/products?category=sports' },
              { label: 'Deals & Offers', path: '/products?category=deals' },
            ].map((cat, idx) => (
              <Link
                key={idx}
                to={cat.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2.5 px-3 text-xs font-bold tracking-wider uppercase text-neutral-200 hover:text-[#84CC16] hover:bg-neutral-900 rounded-xl border-b border-neutral-900 transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {!isAuthenticated && (
            <div className="pt-4 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-extrabold rounded-full border border-neutral-700 text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-black rounded-full btn-lime-gradient uppercase"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

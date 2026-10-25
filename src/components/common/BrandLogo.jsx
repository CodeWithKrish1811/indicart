import React from 'react';
import { Link } from 'react-router-dom';

const BrandLogo = ({ className = '', size = 'md' }) => {
  const sizeConfig = {
    sm: {
      container: 'space-x-2',
      icon: 'w-8 h-8 rounded-lg',
      svg: 'w-4 h-4',
      text: 'text-xl',
    },
    md: {
      container: 'space-x-2.5',
      icon: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl',
      svg: 'w-5 h-5',
      text: 'text-2xl sm:text-[26px]',
    },
    lg: {
      container: 'space-x-3',
      icon: 'w-11 h-11 rounded-2xl',
      svg: 'w-6 h-6',
      text: 'text-3xl',
    }
  }[size] || {
    container: 'space-x-2.5',
    icon: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl',
    svg: 'w-5 h-5',
    text: 'text-2xl sm:text-[26px]',
  };

  return (
    <Link
      to="/"
      aria-label="Indicart - Home"
      className={`flex items-center ${sizeConfig.container} group select-none shrink-0 py-1 ${className}`}
    >
      {/* Modern Gradient Lime Icon Badge with Shopping Cart Icon */}
      <div className={`${sizeConfig.icon} bg-gradient-to-br from-[#A6E527] to-[#84CC16] flex items-center justify-center text-[#0A0A0A] shadow-md shadow-[#84CC16]/25 group-hover:scale-105 group-hover:shadow-[#84CC16]/40 transition-all duration-200 relative overflow-hidden shrink-0`}>
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <svg className={`${sizeConfig.svg} transition-transform duration-200 group-hover:scale-110`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </div>

      {/* Brand Logo Text: "Indicart" */}
      <div className="flex items-center tracking-tight leading-none">
        <span className={`${sizeConfig.text} font-black text-white group-hover:text-neutral-100 transition-colors`}>
          Indi
        </span>
        <span className={`${sizeConfig.text} font-black text-[#84CC16] ml-0.5 group-hover:text-[#A6E527] transition-colors drop-shadow-[0_0_12px_rgba(132,204,22,0.45)]`}>
          cart
        </span>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#84CC16] ml-1" />
      </div>
    </Link>
  );
};

export default BrandLogo;

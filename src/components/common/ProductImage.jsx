import React, { useState } from 'react';

/**
 * ProductImage: Reusable, accessible product image component
 * - Consistent fallback for missing or broken images without layout shifts
 * - Zero invented external URLs
 * - Shimmer loading state with smooth fade-in
 * - Appropriate alternative text and lazy-loading
 */
const ProductImage = ({
  src,
  alt = 'Product image',
  className = 'max-h-full max-w-full object-contain',
  containerClassName = 'w-full h-full flex items-center justify-center',
  fallbackIconSize = 'w-8 h-8',
  fallbackText,
  loading = 'lazy',
  onLoad,
  onError,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  // Synchronize state when src changes
  if (prevSrc !== src) {
    setPrevSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const showFallback = !src || hasError;

  return (
    <div className={`relative ${containerClassName}`}>
      {!showFallback ? (
        <>
          {/* Layout-shift prevention shimmer while image is loading */}
          {!isLoaded && (
            <div
              className="absolute inset-0 bg-slate-100/80 animate-pulse rounded-inherit pointer-events-none"
              aria-hidden="true"
            />
          )}
          <img
            src={src}
            alt={alt}
            loading={loading}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
          />
        </>
      ) : (
        <div
          className="flex flex-col items-center justify-center text-slate-400 p-2 text-center select-none"
          role="img"
          aria-label={alt}
        >
          <svg
            className={fallbackIconSize}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {fallbackText && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 line-clamp-1">
              {fallbackText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductImage;

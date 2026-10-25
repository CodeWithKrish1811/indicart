import React from 'react';
import ProductCard from './ProductCard';
import ProductSkeleton from '../common/ProductSkeleton';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';

const ProductGrid = ({
  products = [],
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  onClearFilters,
  onClearSearch,
  searchQuery = '',
}) => {
  if (isLoading) {
    return <ProductSkeleton count={12} />;
  }

  if (isError) {
    return (
      <ErrorMessage
        title="Unable to Load Products"
        message={error?.data?.message || 'Failed to fetch catalog data. Please try again.'}
        onRetry={onRetry}
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={searchQuery ? `No products found for "${searchQuery}"` : 'No products match your filters'}
        message={
          searchQuery
            ? 'We couldn\'t find any items matching your search term. Check the spelling or try searching for a different item.'
            : 'Try clearing some of your active filters to see more products.'
        }
        actionText={searchQuery ? 'Clear Search' : 'Clear All Filters'}
        onAction={searchQuery && onClearSearch ? onClearSearch : onClearFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;

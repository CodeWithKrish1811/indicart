import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { normalizeProduct, normalizeProducts } from './productNormalizer';

// RTK Query API slice for fetching server product data from DummyJSON
export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://dummyjson.com' }),
  endpoints: (builder) => ({
    // Fetch paginated products list
    getProducts: builder.query({
      query: ({ limit = 12, skip = 0 } = {}) => `products?limit=${limit}&skip=${skip}`,
      transformResponse: (response) => ({
        ...response,
        products: normalizeProducts(response.products || []),
      }),
    }),

    // Fetch single product by ID
    getProductById: builder.query({
      query: (id) => `products/${id}`,
      transformResponse: (response) => normalizeProduct(response),
    }),

    // Fetch product categories list
    getCategories: builder.query({
      query: () => 'products/categories',
    }),

    // Search products by keyword (cleanly trimmed to avoid duplicate cache queries)
    searchProducts: builder.query({
      query: ({ q = '', limit = 12, skip = 0 } = {}) => {
        const cleanQ = typeof q === 'string' ? q.trim() : '';
        return `products/search?q=${encodeURIComponent(cleanQ)}&limit=${limit}&skip=${skip}`;
      },
      transformResponse: (response) => ({
        ...response,
        products: normalizeProducts(response.products || []),
      }),
    }),

    // Fetch products by category
    getProductsByCategory: builder.query({
      query: ({ category = '', limit = 12, skip = 0 } = {}) =>
        `products/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`,
      transformResponse: (response) => ({
        ...response,
        products: normalizeProducts(response.products || []),
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useSearchProductsQuery,
  useGetProductsByCategoryQuery,
} = productsApi;

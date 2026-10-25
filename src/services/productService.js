import { productsApi } from '../features/products/productsApi';
import { normalizeProduct, normalizeProducts } from '../features/products/productNormalizer';

/**
 * Service Abstraction Layer for Indicart Products
 * Decouples components from raw data providers (e.g. DummyJSON)
 * and guarantees normalized IndicartProduct objects.
 */
export const productService = {
  /**
   * Normalize single raw product
   */
  normalizeProduct,

  /**
   * Normalize array of raw products
   */
  normalizeProducts,

  /**
   * Service call to fetch paginated products
   */
  getProducts: async (dispatch, { limit = 12, skip = 0 } = {}) => {
    const result = await dispatch(productsApi.endpoints.getProducts.initiate({ limit, skip }));
    if (result.data) {
      return {
        ...result.data,
        products: normalizeProducts(result.data.products),
      };
    }
    return { products: [], total: 0, limit, skip };
  },

  /**
   * Service call to fetch single product by ID
   */
  getProductById: async (dispatch, id) => {
    const result = await dispatch(productsApi.endpoints.getProductById.initiate(id));
    if (result.data) {
      return normalizeProduct(result.data);
    }
    return null;
  },
};

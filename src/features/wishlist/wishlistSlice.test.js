import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import wishlistReducer, {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  selectWishlistItems,
  selectWishlistCount,
  selectIsInWishlist,
} from './wishlistSlice.js';

describe('wishlistSlice', () => {
  describe('addToWishlist & duplicate prevention', () => {
    it('adds a new product to wishlist', () => {
      const state = { items: [] };
      const product = { id: 101, title: 'Headphones', price: 2999 };
      const nextState = wishlistReducer(state, addToWishlist(product));
      assert.equal(nextState.items.length, 1);
      assert.equal(nextState.items[0].id, 101);
      assert.equal(nextState.items[0].title, 'Headphones');
    });

    it('does NOT create duplicates when adding the same product twice', () => {
      let state = { items: [] };
      const product = { id: 101, title: 'Headphones', price: 2999 };

      state = wishlistReducer(state, addToWishlist(product));
      state = wishlistReducer(state, addToWishlist(product));
      // String ID equality test
      state = wishlistReducer(state, addToWishlist({ ...product, id: '101' }));

      assert.equal(state.items.length, 1);
      assert.equal(state.items[0].id, 101);
    });

    it('gracefully handles missing product data and provides defaults', () => {
      const state = { items: [] };
      const incompleteProduct = { id: 202 }; // No title, price, thumbnail, or brand
      const nextState = wishlistReducer(state, addToWishlist(incompleteProduct));

      assert.equal(nextState.items.length, 1);
      const item = nextState.items[0];
      assert.equal(item.id, 202);
      assert.equal(item.title, 'Indicart Item');
      assert.equal(item.brand, 'Indicart');
      assert.equal(item.price, 0);
      assert.equal(item.originalPrice, 0);
      assert.equal(item.discountPercentage, 0);
      assert.equal(item.thumbnail, '');
      assert.equal(item.stock, 10);
    });

    it('ignores null, undefined, or products without an ID', () => {
      let state = { items: [] };
      state = wishlistReducer(state, addToWishlist(null));
      state = wishlistReducer(state, addToWishlist(undefined));
      state = wishlistReducer(state, addToWishlist({ title: 'No ID' }));
      assert.equal(state.items.length, 0);
    });
  });

  describe('removeFromWishlist', () => {
    it('removes product by matching ID', () => {
      const state = {
        items: [
          { id: 101, title: 'Headphones' },
          { id: 102, title: 'Smartwatch' },
        ],
      };
      const nextState = wishlistReducer(state, removeFromWishlist(101));
      assert.equal(nextState.items.length, 1);
      assert.equal(nextState.items[0].id, 102);
    });

    it('removes product whether ID is passed as string, number, or object', () => {
      let state = {
        items: [
          { id: 101, title: 'Item 1' },
          { id: '102', title: 'Item 2' },
          { id: 103, title: 'Item 3' },
        ],
      };
      state = wishlistReducer(state, removeFromWishlist('101')); // string
      assert.equal(state.items.length, 2);

      state = wishlistReducer(state, removeFromWishlist(102)); // number matching string
      assert.equal(state.items.length, 1);

      state = wishlistReducer(state, removeFromWishlist({ id: 103 })); // object with id
      assert.equal(state.items.length, 0);
    });
  });

  describe('toggleWishlist', () => {
    it('adds product if not in wishlist, removes if already present', () => {
      let state = { items: [] };
      const product = { id: 505, title: 'Wireless Speaker' };

      // Toggle ON
      state = wishlistReducer(state, toggleWishlist(product));
      assert.equal(state.items.length, 1);
      assert.equal(state.items[0].id, 505);

      // Toggle OFF
      state = wishlistReducer(state, toggleWishlist(product));
      assert.equal(state.items.length, 0);
    });
  });

  describe('clearWishlist', () => {
    it('resets wishlist items array to empty', () => {
      const state = {
        items: [
          { id: 1, title: 'Item 1' },
          { id: 2, title: 'Item 2' },
        ],
      };
      const nextState = wishlistReducer(state, clearWishlist());
      assert.equal(nextState.items.length, 0);
    });
  });

  describe('Selectors and defensive deduplication', () => {
    it('selectWishlistItems defensively deduplicates items if state had duplicates', () => {
      const mockState = {
        wishlist: {
          items: [
            { id: 1, title: 'Prod 1' },
            { id: 1, title: 'Prod 1 Duplicate' },
            { id: 2, title: 'Prod 2' },
            null, // should be filtered out
          ],
        },
      };

      const items = selectWishlistItems(mockState);
      assert.equal(items.length, 2);
      assert.equal(items[0].id, 1);
      assert.equal(items[1].id, 2);
    });

    it('selectWishlistCount returns exact unique count', () => {
      const mockState = {
        wishlist: {
          items: [
            { id: 1, title: 'Prod 1' },
            { id: 2, title: 'Prod 2' },
          ],
        },
      };
      assert.equal(selectWishlistCount(mockState), 2);
    });

    it('selectIsInWishlist matches numeric and string IDs accurately', () => {
      const mockState = {
        wishlist: {
          items: [{ id: 100, title: 'Prod 100' }],
        },
      };
      assert.equal(selectIsInWishlist(mockState, 100), true);
      assert.equal(selectIsInWishlist(mockState, '100'), true);
      assert.equal(selectIsInWishlist(mockState, 999), false);
      assert.equal(selectIsInWishlist(mockState, null), false);
    });
  });
});

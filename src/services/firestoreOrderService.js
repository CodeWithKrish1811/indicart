import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firebaseError';

const ORDERS_COLLECTION = 'orders';

/**
 * Service to sync orders with Firebase Firestore
 */
export const firestoreOrderService = {
  /**
   * Save a newly placed order to Firestore
   */
  async saveOrder(order) {
    if (!order || !order.orderId) return null;
    const orderDocRef = doc(db, ORDERS_COLLECTION, order.orderId);

    try {
      await setDoc(orderDocRef, {
        ...order,
        createdAt: serverTimestamp(),
      });
      return order;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${ORDERS_COLLECTION}/${order.orderId}`);
    }
  },

  /**
   * Fetch orders for a specific user email from Firestore
   */
  async getUserOrders(userEmail) {
    if (!userEmail) return [];

    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where('userEmail', '==', userEmail)
      );
      const querySnapshot = await getDocs(q);
      const orders = [];
      querySnapshot.forEach((docSnap) => {
        orders.push({ id: docSnap.id, ...docSnap.data() });
      });
      return orders;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, ORDERS_COLLECTION);
      return [];
    }
  },

  /**
   * Fetch single order by orderId
   */
  async getOrderById(orderId) {
    if (!orderId) return null;
    try {
      const docRef = doc(db, ORDERS_COLLECTION, orderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${ORDERS_COLLECTION}/${orderId}`);
      return null;
    }
  },
};

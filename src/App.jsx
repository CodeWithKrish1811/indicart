import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';
import { store, persistor } from './app/store';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <WishlistProvider>
                <CartProvider>
                  <AppRoutes />
                </CartProvider>
              </WishlistProvider>
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;

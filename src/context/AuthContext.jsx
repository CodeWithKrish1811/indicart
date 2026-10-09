import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../services/firebase';
import {
  loginUserThunk,
  registerUserThunk,
  logoutUserThunk,
  setUser,
  clearUser,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from '../features/auth/authSlice';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

// In-memory access token cache for Google Workspace (Gmail, etc.)
let cachedAccessToken = null;

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        dispatch(
          setUser({
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            photoURL: user.photoURL,
          })
        );
      } else {
        cachedAccessToken = null;
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Google Sign-In with Firebase Auth
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
      }

      const user = result.user;
      dispatch(
        setUser({
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email,
          photoURL: user.photoURL,
        })
      );
      showToast(`Welcome, ${user.displayName || 'Shopper'}!`);
      return { success: true, user };
    } catch (err) {
      console.error('Google Sign In Error:', err);
      showToast(err.message || 'Failed to sign in with Google');
      return { success: false, message: err.message };
    }
  };

  // Standard Email/Password login
  const login = async (email, password) => {
    try {
      const user = await dispatch(loginUserThunk({ email, password })).unwrap();
      showToast(`Welcome back, ${user.name || 'shopper'}!`);
      return { success: true, user, message: `Welcome back, ${user.name}!` };
    } catch (errMsg) {
      const message = typeof errMsg === 'string' ? errMsg : 'Invalid email or password.';
      showToast(message);
      return { success: false, message };
    }
  };

  // Standard Email/Password registration
  const register = async ({ name, email, password }) => {
    try {
      const user = await dispatch(registerUserThunk({ name, email, password })).unwrap();
      showToast('Account created successfully!');
      return { success: true, user, message: 'Account registered successfully!' };
    } catch (errMsg) {
      const message = typeof errMsg === 'string' ? errMsg : 'Registration failed.';
      showToast(message);
      return { success: false, message };
    }
  };

  // Logout both Firebase and local session
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout error:', e);
    }
    cachedAccessToken = null;
    await dispatch(logoutUserThunk());
    dispatch(clearUser());
    showToast('Logged out successfully.');
  };

  const getAccessToken = () => cachedAccessToken;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isAuthenticated: isAuthenticated || !!firebaseUser,
        loading: loading || !authReady,
        error,
        login,
        register,
        loginWithGoogle,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

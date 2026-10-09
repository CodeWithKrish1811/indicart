import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

/**
 * ARCHITECTURE EXPLANATION (Requirement 1 & 9):
 * - Manages auth state using `createAsyncThunk` for login, register, and logout operations.
 * - Stores current user in Redux state with persistence via redux-persist.
 */

const DEMO_USER = {
  id: 'user-demo-1',
  name: 'Rajeev Ranjan',
  email: 'rajeev@example.com',
  createdAt: new Date().toISOString(),
};

export const loginUserThunk = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { getState, rejectWithValue }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const cleanEmail = email.toLowerCase().trim();

    // Check against registered users in state or fallback demo credentials
    const { auth } = getState();
    const registeredUsers = auth.registeredUsers || [];
    
    let found = registeredUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (!found) {
      // Allow demo sign-in for quick testing if no custom registered user
      if (cleanEmail === 'rajeev@example.com' || cleanEmail.includes('demo') || registeredUsers.length === 0) {
        found = { ...DEMO_USER, email: cleanEmail, name: email.split('@')[0] || 'Indicart User' };
      } else {
        return rejectWithValue('Invalid email or password. Please check your credentials.');
      }
    }

    return found;
  }
);

export const registerUserThunk = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email, password }, { getState, rejectWithValue }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const cleanEmail = email.toLowerCase().trim();

    const { auth } = getState();
    const registeredUsers = auth.registeredUsers || [];
    const existing = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      return rejectWithValue('An account with this email address already exists.');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password,
      createdAt: new Date().toISOString(),
    };

    return newUser;
  }
);

export const logoutUserThunk = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return null;
  }
);

const initialState = {
  currentUser: DEMO_USER, // Default logged-in user for seamless demo experience
  registeredUsers: [DEMO_USER],
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    setCurrentUserDirect: (state, action) => {
      state.currentUser = action.payload;
    },
    setUser: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed.';
      })

      // Register
      .addCase(registerUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.registeredUsers.push(action.payload);
        state.error = null;
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed.';
      })

      // Logout
      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.currentUser = null;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearAuthError, setCurrentUserDirect, setUser, clearUser } = authSlice.actions;

export const selectAuthState = (state) => state.auth;
export const selectCurrentUser = createSelector(
  [selectAuthState],
  (auth) => auth?.currentUser || null
);
export const selectIsAuthenticated = createSelector(
  [selectCurrentUser],
  (currentUser) => Boolean(currentUser)
);
export const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth?.loading || false
);
export const selectAuthError = createSelector(
  [selectAuthState],
  (auth) => auth?.error || null
);

export default authSlice.reducer;

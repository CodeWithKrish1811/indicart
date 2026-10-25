# Indicart — Modern Indian E-Commerce Platform

Indicart is a modern, responsive e-commerce web application tailored for the Indian retail market. Built with React 19, Vite, Tailwind CSS v4, and Redux Toolkit, Indicart delivers a complete end-to-end shopping experience featuring INR (₹) currency formatting, GST tax calculations, threshold-based delivery fees, promo coupons, persistent cart and wishlist state, multi-step checkout with address validation, Firebase Authentication, Cloud Firestore sync, and Gmail API order confirmation receipts.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture & Directory Structure](#architecture--directory-structure)
- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Environment Variable Setup](#environment-variable-setup)
- [Firebase Configuration](#firebase-configuration)
- [Available npm Scripts](#available-npm-scripts)
- [Local Development Workflow](#local-development-workflow)
- [Testing & Quality Checks](#testing--quality-checks)

---

## Overview

Indicart provides an intuitive shopping platform designed with Indian e-commerce conventions:
- **Currency & Pricing**: All prices are displayed in Indian Rupees (INR / `₹`) with formatted comma separation.
- **Taxes & Shipping**: 18% GST calculation on net taxable cart subtotal, with automated free shipping on orders of ₹499 and above (₹50 flat charge otherwise).
- **Checkout Wizard**: Indian address form validation enforcing 10-digit mobile numbers and 6-digit PIN codes.
- **Dual-State Persistence**: Redux state persists across reloads via Redux Persist (cart, wishlist, auth, orders, coupons).
- **Cloud Synchronization**: Optional Firebase Google Authentication and Firestore persistence for placed orders.

---

## Key Features

### 1. Product Catalog & Discovery
- **Paginated Product Browsing**: Connects to the DummyJSON API via RTK Query (`productsApi.js`) with client-side normalization into standard Indicart product models (`productNormalizer.js`).
- **8 Customer-Facing Categories**:
  - All Categories
  - Electronics (smartphones, laptops, mobile accessories, tablets)
  - Fashion & Apparel (shirts, shoes, watches, dresses, bags, jewellery)
  - Home & Living (home decoration, furniture, kitchen accessories)
  - Beauty & Fragrance (beauty, fragrances, skin care)
  - Sports & Active (sports accessories, motorcycle)
  - Books & Stationeries (graceful empty state messaging)
  - Deals & Offers (dynamic filter for items with discount ≥ 10%)
- **Multi-Facet Filtering**: Filter products simultaneously by category, multiple brands (OR logic), numeric price range, and minimum star rating.
- **Keyword Aliases Search**: Enhanced client-side query matching supporting aliases for perfumes, laptops, smartphones, footwear, watches, and beauty items.
- **Sorting Options**: Sort by relevance, price (low-to-high, high-to-low), customer rating, or newest arrivals.
- **URL-Driven State**: URL search parameters (`URLSearchParams`) act as the single source of truth for catalog filters, search, and pagination.

### 2. Cart & Price Calculation Engine
- **Centralized Redux Cart**: Normalized cart items tracked in `cartSlice.js` with stock limit bounds and quantity adjustments.
- **Memoized Derived Selectors**: Subtotal, product savings, 18% GST tax, shipping fees, and coupon discounts are calculated dynamically via RTK `createSelector` in `cartCalculations.js`.
- **Cart State Persistence**: Cart contents survive browser refreshes through `redux-persist`.

### 3. Wishlist
- Dedicated `wishlistSlice.js` and `WishlistContext.jsx` enabling instant toggle, add, remove, and counter indicators in the navigation bar.

### 4. Coupon & Discount System
- Async coupon application using Redux `createAsyncThunk` (`applyCouponThunk`) with simulated validation latency.
- Supported promo codes:
  - `SAVE10`: 10% discount on order subtotal.
  - `FLAT50`: ₹50 flat discount on orders with minimum subtotal of ₹299.
  - `WELCOME`: 15% discount for new shoppers.

### 5. Multi-Step Checkout Wizard
- Four-stage progressive checkout flow (`pages/Checkout.jsx`):
  1. **Shipping Address**: Validated with `react-hook-form` and a `yup` schema (full name, 10–15 digit phone number, street, city, state, 6-digit PIN code).
  2. **Delivery Method**: Selectable delivery options (Standard Free/Flat, Express Delivery).
  3. **Payment Method**: Cash on Delivery, UPI, Credit/Debit Card options.
  4. **Review & Place Order**: Order breakdown summary and confirmation.
- Automatically clears cart and redirects to Order Confirmation upon placement.

### 6. Authentication & User Management
- **Google Sign-In**: Firebase Authentication with popup provider requesting scopes for Google Workspace / Gmail access.
- **Email/Password Authentication**: Handled via Redux thunks (`loginUserThunk`, `registerUserThunk`) with a fallback demo user (`DEMO_USER`) for rapid local testing.
- **Protected Routes**: `ProtectedRoute.jsx` component guarding `/checkout`, `/orders`, `/orders/:id`, `/order-confirmation`, and `/profile`.

### 7. Order History & Cloud Storage
- **Firestore Synchronization**: Placed orders are saved to Cloud Firestore (`orders` collection) with server timestamps via `firestoreOrderService.js`.
- **Order Tracking**: Detailed order history page (`pages/Orders.jsx`) and individual order view (`pages/OrderDetails.jsx`).

### 8. Gmail Order Confirmation Receipts
- Order receipts can be generated and dispatched using the Gmail REST API (`gmailService.js`) using the authenticated user's Google OAuth access token.

---

## Tech Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **UI Framework** | React | `^19.2.8` | Core component architecture |
| **Runtime & DOM** | React DOM | `^19.2.8` | DOM rendering |
| **Build Tool** | Vite | `^8.2.2` | Rapid ESM bundler and dev server |
| **Vite React Plugin** | `@vitejs/plugin-react` | `^6.1.0` | React JSX & Fast Refresh support |
| **CSS & Styling** | Tailwind CSS | `^4.3.3` | Utility-first CSS styling |
| **Tailwind Vite Plugin** | `@tailwindcss/vite` | `^4.3.3` | Seamless Vite integration for Tailwind v4 |
| **State Management** | Redux Toolkit | `^2.12.0` | Slices, thunks, selectors, RTK Query |
| **React Redux** | `react-redux` | `^9.3.0` | React bindings for Redux store |
| **State Persistence** | `redux-persist` | `^6.0.0` | LocalStorage state rehydration |
| **Routing** | React Router DOM | `^7.18.3` | Client-side routing and protected routes |
| **Form Handling** | React Hook Form | `^7.87.0` | Performant form state and validation |
| **Schema Validation** | Yup | `^1.7.1` | Address and input validation schemas |
| **Hookform Resolver** | `@hookform/resolvers` | `^5.9.1` | Bridges Yup schemas with React Hook Form |
| **Cloud & Auth** | Firebase | `^13.0.0` | Google Auth & Cloud Firestore |
| **HTTP Client** | Axios | `^1.20.0` | Configurable HTTP requests (`api.js`) |
| **Code Linter** | Oxlint | `^1.79.0` | High-performance JavaScript/React linter |

---

## Architecture & Directory Structure

```
indicart-main/
├── .env.example                 # Example environment variables template
├── .gitignore                   # Git ignore patterns
├── .oxlintrc.json               # Oxlint linter configuration
├── firebase-applet-config.json  # Firebase client credentials
├── firebase-blueprint.json      # Firebase configuration schema
├── firestore.rules              # Firestore security rules
├── index.html                   # HTML entry point
├── package.json                 # Project dependencies and npm scripts
├── vite.config.js               # Vite bundler configuration
├── public/                      # Static assets (favicons, logos, SVGs)
└── src/
    ├── main.jsx                 # Application bootstrapping
    ├── App.jsx                  # Root component with Providers
    ├── App.css                  # Global application styles
    ├── index.css                # Tailwind CSS imports & custom tokens
    ├── app/                     # Redux store setup
    │   ├── store.js             # Redux store & persist configuration
    │   └── rootReducer.js       # Root reducer combining all feature slices
    ├── assets/                  # Images and static media
    ├── components/
    │   ├── common/              # Button, Badge, SearchBar, ProtectedRoute, Skeletons
    │   ├── home/                # HeroSection, PromoBanner, CategoryCard, FeatureCard
    │   ├── layout/              # Navbar, Footer, CategoryDropdownMenu
    │   └── product/             # ProductCard, ProductGrid, ProductFilters, ActiveFilters, ProductSort
    ├── constants/               # App-wide constants
    ├── context/                 # React Context providers (AuthContext, CartContext, WishlistContext, ToastContext)
    ├── data/                    # Local sample data and fallback items
    ├── features/                # Redux feature slices and thunks
    │   ├── auth/                # authSlice (login/register thunks, selectors)
    │   ├── cart/                # cartSlice (items, quantity, coupon dispatch)
    │   ├── coupons/             # couponSlice (applyCouponThunk, validation)
    │   ├── orders/              # ordersSlice (placeOrderThunk, Firestore sync)
    │   ├── products/            # productsApi (RTK Query), productsSlice, normalizer, filters
    │   └── wishlist/            # wishlistSlice (add, remove, toggle)
    ├── layouts/                 # MainLayout with header, main content, and footer
    ├── pages/                   # Route views (Home, Products, ProductDetails, Cart, Wishlist, Checkout, Orders, OrderDetails, OrderConfirmation, Login, Register, Profile)
    ├── routes/                  # AppRoutes router definitions
    ├── services/                # External services (api.js, firebase.js, firestoreOrderService.js, gmailService.js, productService.js)
    └── utils/                   # Calculations (cartCalculations.js, coupons.js, formatCurrency.js, localStorage.js)
```

---

## Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher (tested with `v24.x`)
- **Package Manager**: `npm` (`v9.x` or higher) or `bun`

---

## Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rajeevranjan4812-star/indicart.git
   cd indicart
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

---

## Environment Variable Setup

The application uses Vite environment variables prefixed with `VITE_`.

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Configure available variables (optional, with safe defaults and fallback to `firebase-applet-config.json`):
   ```env
   # Base URL for custom Axios API endpoints (defaults to empty string for direct relative calls)
   VITE_API_BASE_URL=

   # Firebase configuration overrides (optional; falls back to firebase-applet-config.json)
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   VITE_FIREBASE_MEASUREMENT_ID=
   VITE_FIREBASE_FIRESTORE_DATABASE_ID=
   ```

---

## Firebase Configuration

Firebase connection settings are managed in `firebase-applet-config.json` at the root of the project:

```json
{
  "projectId": "<your-firebase-project-id>",
  "appId": "<your-firebase-app-id>",
  "apiKey": "<your-firebase-api-key>",
  "authDomain": "<your-project.firebaseapp.com>",
  "firestoreDatabaseId": "<your-firestore-database-id>",
  "storageBucket": "<your-storage-bucket>",
  "messagingSenderId": "<your-sender-id>",
  "oAuthClientId": "<your-google-oauth-client-id>"
}
```

### Key Integration Points:
- **Authentication**: `src/services/firebase.js` initializes `getAuth(app)` and configures `GoogleAuthProvider` with Gmail scopes.
- **Database**: Firestore is initialized with the dedicated database ID specified in `firestoreDatabaseId`.
- **Security Rules**: Firestore access rules are declared in `firestore.rules`.
- **Offline / Fallback Resilience**: If Firebase is offline or unconfigured, the application gracefully handles connectivity warnings and continues using local Redux state for demo sessions.

---

## Available npm Scripts

The following scripts are defined in `package.json`:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Launches the Vite local dev server on `http://0.0.0.0:3000` with Hot Module Replacement (HMR). |
| `npm run build` | Compiles and bundles production-ready assets into the `dist/` directory using Vite. |
| `npm run lint` | Runs the high-performance Oxlint linter (`oxlint`) across the codebase. |
| `npm run preview` | Starts a local web server to preview the production build from `dist/`. |

---

## Local Development Workflow

1. **Start the development server**:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
3. **Explore Features Locally**:
   - Browse the catalog on `/products` with multi-brand, category, and price filters.
   - Add items to the cart and apply discount coupons (`SAVE10`, `FLAT50`, or `WELCOME`).
   - Sign in using the default demo account (`rajeev@example.com` / `demo`) or via Google Sign-In.
   - Complete checkout through the multi-step address, delivery, and payment wizard.
   - View your placed order in `/orders` and `/orders/:id`.

---

## Testing & Quality Checks

Run the linter and production build before submitting commits:

```bash
# Run Oxlint
npm run lint

# Validate production bundle compilation
npm run build
```

---

## License

This project is private and maintained for the Indicart e-commerce platform.

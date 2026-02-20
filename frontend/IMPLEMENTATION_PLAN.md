# FarmLyf - Dry Fruits E-commerce Implementation Plan

## 1. Project Overview
**Objective:** Build a pack-first dry fruits e-commerce web application.
**Stack:** React (Vite), Tailwind CSS, Context API, GSAP, Framer Motion, Lenis.
**Data:** LocalStorage (Simulated Backend).

## 2. Technical Architecture

### Directory Structure
```
src/
├── assets/
├── context/              # Global State (Auth, Cart, Products)
├── hooks/                # Custom Hooks (useLocalStorage, useCart)
├── lib/                  # Utilities (Animations, Helpers)
├── mockData/             # Seed data for LocalStorage
├── module/
│   ├── admin/
│   │   ├── components/
│   │   ├── layouts/
│   │   └── pages/        # Dashboard, Products, Packs
│   └── user/
│       ├── components/   # UI Components (Cards, Hero)
│       ├── layouts/      # Main Layout, Auth Layout
│       └── pages/        # Home, Shop, ProductDetails, Cart, Checkout
└── App.jsx               # Routing
```

### Data Models (LocalStorage)
*   **users**: `[{ id, name, email, role: 'user'|'admin'|'business', gst?, points }]`
*   **products (SKUs)**: `[{ id, name, image, grade, shelfLife, price }]`
*   **packs**: `[{ id, name, category[], items: [{skuId, qty}], price, tags[] }]`
*   **cart**: `{ userId: [{ packId, qty }] }`
*   **orders**: `[{ id, userId, items, total, status, date }]`

## 3. Implementation Steps

### Phase 1: Foundation & Design System (Current)
1.  **Setup Extensions**: Install Router, GSAP, Framer Motion, Icons.
2.  **Tailwind Configuration**: Implement the specific Color Palette.
3.  **Global Styles**: Setup Typography, Smooth Scroll (Lenis).
4.  **UI Components**: Build Buttons, Inputs, Badge, product Cards.

### Phase 2: Data Layer & Context
1.  **Mock Data Seeding**: Create scripts to populate LocalStorage with realistic SKUs and Packs.
2.  **Context Providers**: 
    *   `AuthContext`: Login/Signup logic.
    *   `ShopContext`: Products, Packs, Cart logic.

### Phase 3: User Module - Core Flow
1.  **Layout**: Navbar (Sticky, animated), Footer.
2.  **Home Page**: Hero Section, Category Grid, Featured Packs.
3.  **Shop/Listing**: Filter by Category, Search, Sort.
4.  **Pack Details**: Image Gallery, SKU breakdown table, Reviews.

### Phase 4: Cart & Checkout
1.  **Cart Drawer/Page**: Quantity adjust, Remove, Coupon input.
2.  **Checkout**: Address form, Order Summary, "Place Order" simulation.
3.  **Order Success**: Confetti, Invoice download mock.

### Phase 5: User Dashboard & Features
1.  **Profile**: Order History, Track Order.
2.  **Diet Plans**: View suggestions.
3.  **Wishlist**: Save for later.

### Phase 6: Admin Module
1.  **Dashboard**: Stats (Revenue, Orders).
2.  **Product Management**: Add/Edit SKUs.
3.  **Pack Architecture**: The "Pack Builder" interface.

## 4. Color Palette (Tailwind)
*   **Primary**: `#00A952` (Green)
*   **Secondary**: `#007A3D` (Dark Green)
*   **Accent**: `#FACC15` (Offer Yellow), `#EF4444` (Error Red)
*   **Wedding**: `#D4AF37` (Gold), `#7F1D1D` (Maroon)

---
*Created by Antigravity*

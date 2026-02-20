# FarmLyf Project: User Functionality & Admin Panel Requirements

This document outlines the existing functionalities and data structures in the User Module, serving as the blueprint for developing the Admin Panel.

---

## 1. User Management
**Current User Functionality:**
- **Profile:** Users manage personal details (Name, Email, Phone, Gender, DOB).
- **Addresses:** Users perform CRUD operations on multiple shipping addresses.
- **Activity:** Users have a Wishlist, Vault (Save for Later), and Recently Viewed history.

**Admin Panel Requirements:**
- **View All Users:** List view of all registered customers.
- **User Details:** Ability to view a specific user's profile, saved addresses, and order history.
- **User Actions:** (Future Scope) Ability to block/unblock users or manually reset passwords.

**Data Structure (User Object):**
```json
{
  "id": "user_123",
  "name": "Aditi",
  "email": "user@example.com",
  "phone": "9876543210",
  "gender": "Female",
  "birthDate": "1995-05-20",
  "password": "hashed_password",
  "addresses": [
      {
          "id": 1,
          "type": "Home",
          "fullName": "Aditi",
          "phone": "9876543210",
          "address": "123 Green St",
          "city": "Indore",
          "state": "MP",
          "pincode": "452001",
          "isDefault": true
      }
  ],
  "wishlist": ["prod_001", "prod_004"],
  "usedCoupons": ["WELCOME50"]
}
```

---

## 2. Product Catalog (Inventory)
**Current User Functionality:**
- **Browsing:** Users view products by category, filter by price/rating, and search.
- **Product Page:** Users view images, variants (sizes), pricing, and descriptions.

**Admin Panel Requirements:**
- **Product List:** Data table of all products with search/filter.
- **Add/Edit Product:** Form to create or update products.
  - **Inputs:** Name, Brand, Category, Description, Tag (e.g., 'Bestseller').
  - **Images:** Image URL upload input.
  - **Variants:** Section to add multiple sizes (Weight, MRP, Selling Price).
- **Inventory Control:** Toggle for "In Stock" / "Out of Stock".

**Data Structure (Product Object):**
```json
{
  "id": "prod_001",
  "brand": "FARMLYF ANMOL",
  "name": "Premium Almonds",
  "category": "Nuts",
  "image": "/path/to/image.png",
  "rating": 4.5,
  "reviews": 120,
  "tag": "Bestseller",
  "variants": [
      {
          "id": "v1",
          "weight": "250g",
          "mrp": 500,
          "price": 350,
          "unitPrice": "140/100g",
          "discount": "30% OFF"
      }
  ]
}
```

---

## 3. Order Management
**Current User Functionality:**
- **Checkout:** Users place orders (COD or Online).
- **Tracking:** Users view a 5-step status timeline (Processing -> Delivered).

**Admin Panel Requirements:**
- **Order Dashboard:** Overview of Recent, Pending, and Completed orders.
- **Order Processing:**
  - **Status Update:** Dropdown to change status (e.g., from 'Processing' to 'Packed', then 'Shipped').
  - **Action Required:** When marking as 'Shipped', Admin must input `Tracking ID` and `Courier Partner`.
- **View Order:** Detailed view showing Items, Shipping Address, and Payment Info.

**Data Structure (Order Object):**
```json
{
  "id": "ORD-17000000",
  "userId": "user_123",
  "date": "2024-01-24T10:00:00Z",
  "status": "Shipped",
  "deliveryStatus": "Shipped",
  "amount": 1250,
  "paymentMethod": "cod", // or 'online'
  "courierPartner": "FarmLyf Express",
  "trackingId": "TRK-123456789",
  "items": [
      { "id": "v1", "name": "Almonds", "qty": 2, "price": 350 }
  ],
  "shippingAddress": { ... },
  "statusHistory": [
      { "status": "Processing", "timestamp": "...", "info": "Order Placed" },
      { "status": "Shipped", "timestamp": "...", "info": "Shipped via BlueDart" }
  ]
}
```

---

## 4. Returns & Replacements (RMA)
**Current User Functionality:**
- **Request:** Users initiate return/exchange for delivered items within 7 days.
- **Reasons:** Users select reasons like "Quality Issue" or "Wrong Item".

**Admin Panel Requirements:**
- **Requests Queue:** List of all pending return requests.
- **Approval Workflow:**
  - **Approve:** Triggers "Pickup Scheduled" status.
  - **Reject:** Marks request as rejected with a reason.
  - **Refund/Replace:** Final step to mark refund processed or new order dispatched.

**Data Structure (Return Object):**
```json
{
  "id": "RET-999",
  "orderId": "ORD-17000000",
  "userId": "user_123",
  "type": "refund", // or 'replace'
  "status": "Pending", // Approved, Picked Up, Refunded
  "reason": "Quality Issue",
  "comments": "Packet was torn",
  "items": [ ... ],
  "requestDate": "..."
}
```

---

## 5. Marketing & Coupons
**Current User Functionality:**
- **Apply Coupon:** Logic checks for validity, expiry, min order value, and usage limits.

**Admin Panel Requirements:**
- **Coupon Manager:** CRUD interface for coupons.
- **Configuration:**
  - Set Code (e.g., `SAVE20`).
  - Set Discount Type (`percent` or `flat`).
  - Set `validUntil` date.
  - Set `minOrderValue` and Usage Limits (`usageLimit`, `perUserLimit`).

**Data Structure (Coupon Object):**
```json
{
  "id": "cpn_01",
  "code": "SAVE20",
  "type": "percent", // or 'flat', 'free_shipping'
  "value": 20,
  "minOrderValue": 500,
  "maxDiscount": 100, // Optional cap
  "validUntil": "2025-12-31",
  "usageLimit": 1000,
  "usageCount": 150,
  "perUserLimit": 1,
  "active": true
}
```

# 🍔 Food Delivery Backend Architecture

Scalable production-level food delivery backend inspired by:

* Swiggy
* Zomato
* Uber Eats
* DoorDash

Built using modern backend architecture with:

* Node.js
* Express.js
* MongoDB
* PostgreSQL
* Redis
* Socket.IO
* JWT Authentication
* Zod Validation

---

# 🚀 Tech Stack

## Frontend

* React.js
* TypeScript
* Ant Design
* Tailwind CSS
* Socket.IO Client

---

## Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* PostgreSQL
* Redis
* JWT Authentication
* Socket.IO
* Zod Validation

---

# 👥 Main Roles

## Customer

* OTP Login/Register
* Browse restaurants
* Search & filters
* Place orders
* Live order tracking
* Ratings & reviews
* Payments

---

## Restaurant Partner

* Apply for onboarding
* Upload business documents
* Admin approval workflow
* Manage restaurants
* Open/Close restaurants
* Menu management
* Order handling

---

## Delivery Partner

* Apply with vehicle & documents
* Live location updates
* Accept/reject orders
* Earnings tracking
* Availability management
* Real-time order delivery

---

## Admin

* Approve/reject restaurant partners
* Approve/reject delivery partners
* Block/suspend accounts
* Feature restaurants
* Analytics & monitoring

---

## Master Admin

* Full platform access
* Manage admins
* Global controls
* Reports & analytics

---

# 🗂️ Backend Folder Structure

```text
src/
│
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── validations/
├── enums/
├── services/
├── sockets/
├── utils/
├── constants/
├── uploads/
├── docs/
│
├── app.js
└── server.js
```

---

# 🧠 Professional Architecture

## Current Backend Features

### ✅ Zod Validation System

Used for:

* Body validation
* Query validation
* Params validation
* Strong API validation

Example:

```js
router.post(
  "/create",
  validate(createRestaurantSchema),
  createRestaurant,
);
```

---

## ✅ Role-Based Authentication

Supported Roles:

```js
CUSTOMER
ADMIN
MASTER
RESTAURANT_PARTNER
DELIVERY_PARTNER
```

Multi-role support enabled:

Example:

```js
roles: ["CUSTOMER", "DELIVERY_PARTNER"]
```

---

## ✅ Centralized Enum System

Enums stored in:

```text
src/enums/
```

Examples:

* Roles.enum.js
* RestaurantStatus.enum.js
* RestaurantType.enum.js
* VehicleType.enum.js
* DeliveryPartnerStatus.enum.js
* OrderStatus.enum.js

---

# 🍽️ Restaurant System

## Restaurant Features

### Restaurant Types

```text
VEG
NON_VEG
PURE_VEG
```

### Restaurant Status

```text
ACTIVE
INACTIVE
BLOCKED
```

### Restaurant Controls

* Open/Close
* Featured restaurants
* Delivery settings
* Ratings
* Geo location
* Search & filters

---

# 🔍 Restaurant Filtering System

Supported filters:

```text
search
city
cuisine
isFeatured
isOpen
isVeg
restaurantType
rating
sorting
pagination
```

Example API:

```bash
GET /api/restaurants?city=Mumbai&isVeg=true
```

---

# 📍 Geo Location System

## MongoDB 2dsphere Index

```js
restaurantSchema.index({
  location: "2dsphere",
});
```

Used for:

* Nearby restaurants
* Delivery tracking
* Driver matching

---

## Nearby Restaurant Query

```js
$near
$geometry
$maxDistance
```

---

# 🚚 Delivery Partner System

## Delivery Partner Workflow

```text
Apply
   ↓
Upload Documents
   ↓
PENDING
   ↓
Admin Verification
   ↓
APPROVED
   ↓
User Role Updated
   ↓
Can Accept Orders
```

---

## Delivery Partner Features

### Vehicle Types

```text
BIKE
BICYCLE
SCOOTER
```

### Delivery Partner Status

```text
PENDING
UNDER_REVIEW
APPROVED
REJECTED
BLOCKED
```

---

## Live Tracking Features

* Real-time location updates
* Online/Offline status
* Nearby order detection
* Order assignment
* Delivery status updates

---

# 🔐 Authentication System

## OTP Authentication Workflow

```text
Enter Phone
     ↓
Generate OTP
     ↓
Store OTP in Redis
     ↓
Verify OTP
     ↓
Generate JWT
     ↓
Login Success
```

---

## JWT Strategy

### Access Token

* Short expiry
* API authentication

### Refresh Token

* Long expiry
* Session management

---

# ⚡ Redis Usage

Used for:

* OTP storage
* Rate limiting
* Session storage
* Caching
* Socket mapping
* Live tracking cache

---

## Example Redis Keys

```bash
otp:9876543210
otp_attempts:9876543210
otp_resend:9876543210
socket:userId
```

---

# 🛡️ Security Features

## Implemented

* JWT Authentication
* Role-based access
* OTP expiry
* Rate limiting
* Validation middleware
* Error handling middleware
* Protected routes

---

# 📦 MongoDB Usage

MongoDB stores:

* Users
* Restaurants
* Restaurant Partners
* Delivery Partners
* Orders
* Menus
* Reviews
* Notifications
* Live locations

---

# 🧾 PostgreSQL Usage

PostgreSQL stores:

* Payments
* Wallets
* Transactions
* Commission reports
* Financial analytics
* Payouts

---

# 🔌 Socket.IO Features

## Customer

* Live order tracking
* Delivery tracking
* Notifications

---

## Restaurant

* New order alerts
* Live order updates

---

## Delivery Partner

* Nearby order requests
* Live delivery tracking
* Online/offline updates

---

# 🧪 Validation Architecture

Using:

* Zod
* Custom validate middleware

Example:

```js
req.body = await schema.parseAsync(req.body);
```

Validation includes:

* Restaurant validation
* Partner validation
* Delivery partner validation
* Auth validation

---

# 📊 Pagination & Sorting

Implemented:

* Pagination
* Search
* Filtering
* Dynamic sorting

Example:

```bash
?page=1&limit=10&sortBy=rating&order=desc
```

---

# 🏗️ Professional Backend Practices

## Current Architecture Includes

✅ Async handler
✅ Centralized error handling
✅ Enum architecture
✅ Validation middleware
✅ Geo queries
✅ JWT authentication
✅ Multi-role system
✅ Redis caching
✅ Socket architecture
✅ Pagination & filtering
✅ Scalable folder structure
✅ Database indexing

---

# 📈 MongoDB Indexing

Implemented indexes:

```js
restaurantSchema.index({ location: "2dsphere" });

restaurantSchema.index({ status: 1 });

restaurantSchema.index({ isFeatured: 1 });

restaurantSchema.index({ isOpen: 1 });

restaurantSchema.index({ cuisines: 1 });

restaurantSchema.index({ rating: -1 });

restaurantSchema.index({ restaurantName: "text" });
```

---

# 🎯 Current Main Controllers

## Restaurant Controllers

* createRestaurant
* updateRestaurant
* deleteRestaurant
* getMyRestaurants
* getRestaurantById
* getAllRestaurants
* getNearbyRestaurants
* getFeaturedRestaurants
* toggleRestaurantOpenStatus
* featureRestaurant
* blockRestaurant

---

## Restaurant Partner Controllers

* applyRestaurantPartner
* approvePartner
* rejectPartner
* suspendPartner
* getPendingPartners
* getMyPartnerProfile

---

## Delivery Partner Controllers

* applyDeliveryPartner
* approveDeliveryPartner
* rejectDeliveryPartner
* blockDeliveryPartner
* updateLiveLocation
* goOnline
* goOffline
* acceptOrder
* getAvailableOrders

---

# 🚀 Future Modules

## Customer

* Wishlist
* Coupons
* Wallet
* Referral system

---

## Restaurant

* Inventory
* Restaurant analytics
* Earnings dashboard

---

## Delivery

* Route optimization
* Heat maps
* Incentives

---

## Admin

* Fraud detection
* Revenue reports
* Live dashboards
* Commission management

---

# 🎯 Final Goal

Build a highly scalable production-ready food delivery platform with:

* Clean Architecture
* Enterprise Backend Design
* Redis Optimization
* Real-time Socket System
* Professional Validation System
* Geo-based Search
* Multi-role Authentication
* Advanced Filtering & Pagination
* Scalable Database Design

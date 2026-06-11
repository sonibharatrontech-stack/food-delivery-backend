# 🍔 BiteRush - Production Grade Food Delivery Platform

A scalable, enterprise-level food delivery ecosystem inspired by industry leaders:

* Swiggy
* Zomato
* Uber Eats
* DoorDash

BiteRush is designed using modern distributed architecture principles with real-time tracking, multi-role authentication, geospatial search, Redis caching, Socket.IO communication, and scalable database design.

---

# 🚀 Tech Stack

## Frontend

* React.js
* TypeScript
* Redux Toolkit + RTK Query
* React Router
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
* Socket.IO
* JWT Authentication
* Zod Validation

---

# 🏗️ System Architecture

```text
                 ┌─────────────────────┐
                 │     React Client    │
                 └──────────┬──────────┘
                            │
                     REST APIs
                            │
                            ▼
                ┌─────────────────────┐
                │    Express Server   │
                └───────┬─────┬───────┘
                        │     │
                        │     │
                        │     ▼
                        │  Socket.IO
                        │
                        ▼
               ┌──────────────────┐
               │      Redis       │
               └──────────────────┘
                        ▲
                        │
         ┌──────────────┼──────────────┐
         │                             │
         ▼                             ▼
 ┌────────────────┐          ┌────────────────┐
 │    MongoDB     │          │ PostgreSQL     │
 └────────────────┘          └────────────────┘
```

---

# 👥 Platform Roles

## Customer

### Features

* OTP Login & Registration
* Browse Restaurants
* Search & Filters
* Restaurant Details
* Add To Cart
* Place Orders
* Live Order Tracking
* Ratings & Reviews
* Order History
* Address Management
* Notifications

---

## Restaurant Partner

### Features

* Partner Application
* Document Verification
* Admin Approval Workflow
* Restaurant Creation
* Restaurant Management
* Menu Management
* Open / Close Restaurant
* Order Management
* Earnings Dashboard

---

## Delivery Partner

### Features

* Delivery Partner Application
* Vehicle Verification
* Live Location Updates
* Accept / Reject Orders
* Online / Offline Availability
* Active Deliveries
* Earnings Tracking
* Delivery History

---

## Admin

### Features

* Restaurant Partner Approval
* Delivery Partner Approval
* User Management
* Restaurant Moderation
* Featured Restaurants
* Analytics Dashboard
* Platform Monitoring

---

## Master Admin

### Features

* Complete Platform Access
* Admin Management
* Revenue Monitoring
* Global Platform Controls
* Security Controls
* Audit Logs

---

# 📂 Backend Folder Structure

```text
src
│
├── config
├── constants
├── controllers
├── middlewares
├── models
├── routes
├── services
├── sockets
├── validations
├── enums
├── utils
├── uploads
├── docs
│
├── app.js
└── server.js
```

---

# 🔐 Authentication Architecture

## OTP Authentication Flow

```text
User Enters Phone Number
            │
            ▼
Generate OTP
            │
            ▼
Store OTP In Redis
            │
            ▼
Verify OTP
            │
            ▼
Generate JWT Tokens
            │
            ▼
Authenticated User
```

---

## JWT Strategy

### Access Token

Used For:

* API Authentication
* Protected Routes

### Refresh Token

Used For:

* Session Renewal
* Long-Term Login

---

# 👤 Multi Role System

Supported Roles:

```js
CUSTOMER
RESTAURANT_PARTNER
DELIVERY_PARTNER
ADMIN
MASTER_ADMIN
```

Multiple Roles Supported:

```js
roles: [
  "CUSTOMER",
  "DELIVERY_PARTNER"
]
```

---

# 📍 Geo Location Architecture

MongoDB 2dsphere indexing powers:

* Nearby Restaurants
* Driver Matching
* Live Tracking
* Location Search

Example:

```js
restaurantSchema.index({
  location: "2dsphere",
});
```

Nearby Search:

```js
$near
$geometry
$maxDistance
```

---

# 🍽️ Restaurant Module

## Restaurant Types

```text
VEG
NON_VEG
PURE_VEG
```

## Restaurant Status

```text
ACTIVE
INACTIVE
BLOCKED
```

## Features

* Featured Restaurants
* Open / Close Status
* Ratings
* Cuisine Filters
* Geo Search
* Availability Control

---

# 🔎 Restaurant Search & Filtering

Supported Filters:

```text
search
city
cuisine
isFeatured
isOpen
restaurantType
rating
sortBy
pagination
```

Example:

```bash
GET /api/restaurant?city=Mumbai&isOpen=true
```

---

# 🚚 Delivery Partner Workflow

```text
Apply
  │
  ▼
Upload Documents
  │
  ▼
PENDING
  │
  ▼
Admin Verification
  │
  ▼
APPROVED
  │
  ▼
Role Updated
  │
  ▼
Eligible For Deliveries
```

---

# 🚗 Vehicle Types

```text
BIKE
SCOOTER
BICYCLE
```

---

# 📦 Order Lifecycle

```text
PLACED
    │
    ▼
CONFIRMED
    │
    ▼
PREPARING
    │
    ▼
READY_FOR_PICKUP
    │
    ▼
PICKED_UP
    │
    ▼
OUT_FOR_DELIVERY
    │
    ▼
DELIVERED
```

---

# ⚡ Redis Architecture

Redis is used for:

* OTP Storage
* Session Management
* Rate Limiting
* API Caching
* Socket Mapping
* Live Tracking Cache

Example Keys:

```bash
otp:9876543210

otp_attempts:9876543210

otp_resend:9876543210

socket:userId

driver_location:userId
```

---

# 🔌 Real-Time Socket.IO System

## Customer Events

* Order Updates
* Delivery Tracking
* Notifications

## Restaurant Events

* New Orders
* Order Status Updates

## Delivery Partner Events

* Nearby Orders
* Order Assignment
* Live Location Sharing

---

# 📡 Live Tracking Architecture

```text
Delivery Partner
        │
        ▼
Socket.IO Event
        │
        ▼
Redis Cache
        │
        ▼
Order Tracking Service
        │
        ▼
Customer Live Tracking Page
```

---

# 🧾 Database Architecture

## MongoDB

Stores:

* Users
* Restaurants
* Restaurant Partners
* Delivery Partners
* Orders
* Menus
* Reviews
* Addresses
* Notifications

---

## PostgreSQL

Stores:

* Payments
* Wallets
* Transactions
* Commissions
* Revenue Reports
* Payouts
* Financial Analytics

---

# 🛡️ Validation Architecture

Using:

* Zod
* Custom Validation Middleware

Example:

```js
router.post(
  "/create",
  validate(createRestaurantSchema),
  createRestaurant
);
```

Validation Covers:

* Request Body
* Query Parameters
* Route Parameters
* File Upload Validation

---

# 📊 Pagination & Sorting

Features:

* Search
* Pagination
* Dynamic Sorting
* Advanced Filtering

Example:

```bash
?page=1
&limit=10
&sortBy=rating
&order=desc
```

---

# 📈 Database Indexing

```js
restaurantSchema.index({
  location: "2dsphere",
});

restaurantSchema.index({
  status: 1,
});

restaurantSchema.index({
  isFeatured: 1,
});

restaurantSchema.index({
  isOpen: 1,
});

restaurantSchema.index({
  cuisines: 1,
});

restaurantSchema.index({
  rating: -1,
});

restaurantSchema.index({
  restaurantName: "text",
});
```

---

# 🎯 Core Controllers

## Restaurant

* createRestaurant
* updateRestaurant
* deleteRestaurant
* getRestaurantById
* getMyRestaurants
* getAllRestaurants
* getFeaturedRestaurants
* getNearbyRestaurants
* toggleRestaurantOpenStatus
* featureRestaurant
* blockRestaurant

---

## Restaurant Partner

* applyRestaurantPartner
* approvePartner
* rejectPartner
* suspendPartner
* getPendingPartners
* getMyPartnerProfile

---

## Delivery Partner

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

## Orders

* placeOrder
* cancelOrder
* getOrderDetails
* getMyOrders
* updateOrderStatus
* assignDeliveryPartner
* liveTracking

---

# 🚀 Planned Features

## Customer

* Wishlist
* Wallet
* Coupons
* Referral Program
* Subscription Plans

## Restaurant

* Inventory Management
* Restaurant Analytics
* Smart Recommendations

## Delivery

* Route Optimization
* Heat Maps
* Incentive Programs

## Admin

* Fraud Detection
* Revenue Dashboard
* Live Monitoring
* Commission Management

---

# 🏆 Engineering Practices

### Implemented

* Clean Architecture
* Service Layer Pattern
* Repository Pattern Ready
* Async Handler
* Centralized Error Handling
* Role Based Authorization
* Zod Validation
* JWT Authentication
* Redis Caching
* Socket.IO Integration
* MongoDB Indexing
* Pagination & Filtering
* Geospatial Queries
* Production Ready Folder Structure

---

# 🎯 Project Goal

Build a highly scalable, production-ready food delivery platform capable of supporting:

* Millions of Users
* Thousands of Restaurants
* Thousands of Delivery Partners
* Real-Time Order Tracking
* Secure Authentication
* High Performance APIs
* Scalable Database Design
* Enterprise-Level Architecture

---

## Developed By

### BiteRush Engineering Team

Building the next-generation food delivery ecosystem with modern backend architecture and real-time technologies.

# Food Delivery Backend Architecture

## Tech Stack

### Frontend
- React.js
- TypeScript
- Ant Design
- Tailwind CSS
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- PostgreSQL
- Redis
- JWT Authentication
- Socket.IO

---

# System Workflow

## Main Roles

### Customer
- Login/Register with OTP
- Browse restaurants
- Place orders
- Live order tracking
- Payments
- Ratings & reviews

### Restaurant Partner
- Apply for onboarding
- Upload documents
- Manage restaurants
- Manage menu & orders
- Open/close restaurant

### Delivery Partner
- Apply with documents
- Admin verification
- Accept/reject deliveries
- Live location tracking
- Earnings management

### Admin
- Verify restaurant partners
- Verify delivery partners
- Suspend/block accounts
- Feature restaurants
- Manage commissions
- Analytics & monitoring

### Master Admin
- Full system access
- Manage admins
- Platform controls
- Global reports

---

# Database Architecture

## MongoDB Usage
Use MongoDB for:
- Users
- Restaurant Partners
- Restaurants
- Delivery Partners
- Orders
- Menus
- Reviews
- Notifications
- OTP logs
- Live tracking

MongoDB is ideal for:
- Flexible schemas
- Fast development
- Geo queries
- Real-time app data

---

## PostgreSQL Usage
Use PostgreSQL for:
- Payments
- Transactions
- Wallets
- Payouts
- Accounting
- Commission reports
- Financial analytics

PostgreSQL is ideal for:
- ACID transactions
- Financial consistency
- Reporting
- Relational data

---

## Redis Usage
Use Redis for:
- OTP storage
- Session storage
- Rate limiting
- Caching
- Live tracking cache
- Active sockets
- Temporary tokens

Example Redis Keys:

```bash
otp:9876543210
otp_attempts:9876543210
otp_resend:9876543210
socket:userId
```

---

# OTP Authentication Workflow

## Register/Login Flow

```text
User enters phone
      ↓
Check user exists
      ↓
Generate OTP
      ↓
Store OTP in Redis
      ↓
Send SMS
      ↓
Verify OTP
      ↓
Generate JWT Token
      ↓
Login Success
```

---

# Redis OTP Strategy

## Save OTP

```js
await redisClient.set(`otp:${phone}`, otp, {
  EX: 300,
});
```

## Auto Delete
Redis automatically deletes OTP after expiry.

---

# OTP Security Improvements

## Rate Limiting

Prevent OTP spam:

```text
Max 5 OTP/hour
```

Redis Key:

```text
otp_attempts:9876543210
```

---

## Resend Cooldown

Prevent instant resend:

```text
30 seconds cooldown
```

Redis Key:

```text
otp_resend:9876543210
```

---

# Restaurant Partner Workflow

## Onboarding Flow

```text
User applies as Restaurant Partner
        ↓
Documents uploaded
        ↓
Status = PENDING
        ↓
Admin reviews documents
        ↓
APPROVED / REJECTED
        ↓
Partner can create restaurants
```

---

# Restaurant Workflow

## Restaurant Creation Flow

```text
Approved Partner
      ↓
Create Restaurant
      ↓
Generate Slug
      ↓
Save Geo Location
      ↓
Restaurant Live
```

---

# Slugify Usage

## Purpose
Creates SEO-friendly URLs.

Example:

```text
Pizza Hut Mumbai
↓
pizza-hut-mumbai
```

## Usage

```js
const slug = slugify(restaurantName, {
  lower: true,
  strict: true,
});
```

---

# Restaurant Features

## Restaurant Status

```text
ACTIVE
INACTIVE
BLOCKED
```

## Restaurant Controls
- Open/Close restaurant
- Delivery settings
- Featured restaurants
- Menu management
- Order management
- Ratings

---

# Delivery Partner Workflow

## Onboarding

```text
Delivery Partner Applies
        ↓
Upload Documents
        ↓
Admin Verification
        ↓
Approval
        ↓
Can Accept Orders
```

---

# Geo Location System

## MongoDB 2dsphere Index

```js
restaurantSchema.index({
  location: "2dsphere",
});
```

## Nearby Restaurants Query

```js
$near
$geometry
$maxDistance
```

Used for:
- Nearby restaurants
- Delivery tracking
- Driver matching

---

# Socket.IO Usage

## Real-time Features

### Customer
- Live order status
- Delivery tracking
- Notifications

### Restaurant
- New order alerts
- Order updates

### Delivery Partner
- New delivery requests
- Location updates

---

# Authentication Strategy

## JWT Tokens

### Access Token
- Short expiry
- API authentication

### Refresh Token
- Long expiry
- Session renewal

---

# Recommended Project Structure

```text
src/
│
├── config/
├── controllers/
├── services/
├── routes/
├── middlewares/
├── models/
├── utils/
├── validations/
├── sockets/
├── redis/
├── jobs/
├── constants/
├── enums/
└── app.js
```

---

# Professional Backend Practices

## Always Use
- Controller-Service pattern
- Redis caching
- Proper validation
- JWT auth middleware
- Role-based access
- Rate limiting
- Pagination
- Error handling middleware
- Centralized responses
- Environment variables

---

# Suggested Future Modules

## Customer Side
- Cart
- Wishlist
- Coupons
- Wallet
- Referral system

## Restaurant Side
- Menu categories
- Inventory
- Analytics
- Earnings dashboard

## Delivery Side
- Heat maps
- Route optimization
- Incentives

## Admin Side
- Fraud detection
- Commission management
- Revenue reports
- Live monitoring

---

# Redis Connection Setup

```js
import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.log("Redis Error:", err);
});

await redisClient.connect();

export default redisClient;
```

---

# Check Redis Working

## Method 1

```bash
redis-server
```

## Method 2

```js
await redisClient.set("test", "hello");

const value = await redisClient.get("test");

console.log(value);
```

Expected:

```text
hello
```

---

# Restaurant Partner Main Controllers

## Partner Controllers
- applyRestaurantPartner
- getMyPartnerProfile
- updatePartnerProfile
- approvePartner
- rejectPartner
- suspendPartner
- getPendingPartners

---

# Restaurant Main Controllers

## Restaurant Controllers
- createRestaurant
- updateRestaurant
- deleteRestaurant
- getMyRestaurants
- getNearbyRestaurants
- getFeaturedRestaurants
- toggleRestaurantOpenStatus
- blockRestaurant
- featureRestaurant

---

# Object.assign Usage

```js
Object.assign(restaurant, req.body);
```

Used for:
- Updating multiple fields dynamically
- Cleaner update logic
- Avoid repetitive assignments

Equivalent to:

```js
restaurant.name = req.body.name;
restaurant.phone = req.body.phone;
restaurant.email = req.body.email;
```

---

# Final Architecture Goal

Build a scalable production-level food delivery platform similar to:

- Swiggy
- Zomato
- Uber Eats
- DoorDash

Using:
- Clean architecture
- Scalable backend
- Redis optimization
- Real-time sockets
- Professional workflows
- Secure authentication


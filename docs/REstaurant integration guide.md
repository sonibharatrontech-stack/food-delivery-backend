Restaurant Partner Integration Guide

Purpose

This document explains how the Restaurant Partner Backend should integrate with the Order & Delivery System.

---

Ownership

Restaurant Team Responsibilities

- Restaurant Authentication
- Restaurant Dashboard
- Restaurant CRUD
- Restaurant Order Management UI

Delivery Team Responsibilities

- Orders
- FSM
- Auto Assignment
- Delivery Partners
- Tracking
- Socket Events

---

Restaurant Order Lifecycle

When Customer Places Order:

Current Status:

PLACED

Restaurant Dashboard should display:

New Order Received

---

Step 1

Restaurant Accepts Order

API:

PATCH /api/orders/:id/status

Body:

{
"orderStatus": "CONFIRMED"
}

Result:

PLACED
↓
CONFIRMED

---

Step 2

Restaurant Starts Preparing

API:

PATCH /api/orders/:id/status

Body:

{
"orderStatus": "PREPARING"
}

Result:

CONFIRMED
↓
PREPARING

---

Step 3

Food Ready

API:

PATCH /api/orders/:id/status

Body:

{
"orderStatus": "READY_FOR_PICKUP"
}

Result:

PREPARING
↓
READY_FOR_PICKUP

---

Required Integration

When status becomes:

READY_FOR_PICKUP

Restaurant backend should trigger:

autoAssignPartner(orderId)

Expected Result:

READY_FOR_PICKUP
↓
ASSIGNED

Partner Assigned

---

Assignment Result

Order:

{
deliveryPartner: PARTNER_ID,
orderStatus: "ASSIGNED"
}

Partner:

{
isBusy: true,
currentOrder: ORDER_ID
}

---

Customer View

Customer should automatically see:

Order Confirmed
↓
Preparing
↓
Ready For Pickup
↓
Delivery Partner Assigned

through tracking APIs.

---

Do Not Implement

Restaurant Team SHOULD NOT implement:

- Delivery Assignment Logic
- Tracking Logic
- Socket Tracking
- Delivery Partner Management

These already exist in Delivery Module.
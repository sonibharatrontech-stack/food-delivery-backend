BiteRush Complete System Lifecycle

Customer Flow

Open Restaurant
↓
View Menu
↓
Add To Cart
↓
Checkout
↓
Select Address
↓
Select Payment Method
↓
Place Order

---

Backend Checkout Flow

Find Cart
↓
Find Restaurant
↓
Build Order Items
↓
Create Order
↓
Status = PLACED
↓
Timeline Created
↓
Delete Cart
↓
Return Order

---

Restaurant Flow

PLACED
↓
CONFIRMED
↓
PREPARING
↓
READY_FOR_PICKUP

---

Auto Assignment Flow

READY_FOR_PICKUP
↓
Find Nearest Available Partner
↓
Assign Partner
↓
Update Order
↓
Update Partner
↓
Status = ASSIGNED

---

Delivery Partner Flow

ASSIGNED
↓
Accept Order
↓
PICKED_UP
↓
OUT_FOR_DELIVERY
↓
DELIVERED

---

Live Tracking Flow

Partner Updates Location
↓
Socket Event Emitted
↓
Order Live Location Updated
↓
Customer Tracking API Updated
↓
Frontend Map Updated

---

Tracking API

GET /api/orders/:orderId/live-tracking

Returns:

- Order Status
- Partner Details
- Live Location
- ETA
- Distance
- Delivery Address
- Timeline

---

Final Successful Flow

Customer
↓
Cart
↓
Checkout
↓
PLACED
↓
CONFIRMED
↓
PREPARING
↓
READY_FOR_PICKUP
↓
ASSIGNED
↓
PICKED_UP
↓
OUT_FOR_DELIVERY
↓
DELIVERED

System Complete

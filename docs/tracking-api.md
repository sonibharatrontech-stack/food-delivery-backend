BiteRush User Tracking API Documentation

Module Owner

Backend: Delivery Partner & User Tracking Team

Purpose:

This API provides real-time order tracking information to the customer application.

---

Base Endpoint

GET /api/orders/:orderId/live-tracking

Example:

GET /api/orders/6a19652504a8565150d4a04d/live-tracking

---

Success Response

{
"success": true,
"data": {
"orderId": "6a19652504a8565150d4a04d",

    "orderStatus": "ASSIGNED",

    "assignedAt": "2026-06-02T12:37:37.664Z",

    "pickedUpAt": null,

    "deliveredAt": null,

    "estimatedDeliveryTime": 30,

    "liveLocation": {
      "lat": 19.0765,
      "lng": 72.878,
      "updatedAt": "2026-06-03T05:36:17.832Z"
    },

    "distanceFromCustomer": 0.06,

    "eta": 1,

    "deliveryPartner": {
      "_id": "6a1e70f1d2f10e2011ad16a8",
      "partnerId": "DP-1780379889166",
      "vehicleType": "BIKE",
      "vehicleNumber": "MH12AB1234",
      "isOnline": true,

      "currentLocation": {
        "type": "Point",
        "coordinates": [
          72.878,
          19.0765
        ]
      }
    },

    "restaurant": {
      "_id": "6a1988ce855a918e0edd6d20",
      "restaurantName": "Pizza Palace"
    },

    "deliveryAddress": {
      "street": "MG Road",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "landmark": "Near Metro",
      "label": "HOME",

      "location": {
        "lat": 19.076,
        "lng": 72.8777
      }
    },

    "items": [
      {
        "menuItem": "681234abcd1234abcd5678bb",
        "name": "Paneer Pizza",
        "quantity": 2,
        "price": 399,
        "image": "pizza.jpg",
        "isVeg": true
      }
    ],

    "subtotal": 798,

    "deliveryFee": 40,

    "taxes": 20,

    "discount": 50,

    "totalAmount": 808,

    "statusTimeline": [
      {
        "status": "ASSIGNED",
        "changedAt": "2026-06-02T12:37:37.665Z"
      }
    ]

}
}

---

Order Status Values

Possible values:

PLACED
CONFIRMED
PREPARING
READY_FOR_PICKUP
ASSIGNED
PICKED_UP
OUT_FOR_DELIVERY
DELIVERED
CANCELLED

Frontend should use these values to render tracking progress.

---

ETA

Field:

{
"eta": 1
}

Unit:

Minutes

Example:

Your order will arrive in 1 minute

---

Distance From Customer

Field:

{
"distanceFromCustomer": 0.06
}

Unit:

Kilometers

Example:

Your rider is 0.06 km away

---

Live Rider Location

Field:

{
"liveLocation": {
"lat": 19.0765,
"lng": 72.878
}
}

Used for:

- Google Maps
- Leaflet Maps
- OpenStreetMap
- Mapbox

---

Delivery Partner Details

Field:

{
"deliveryPartner": {
"partnerId": "DP-1780379889166",
"vehicleType": "BIKE",
"vehicleNumber": "MH12AB1234",
"isOnline": true
}
}

Used for:

- Rider Card
- Vehicle Details
- Online Status

---

Restaurant Details

Field:

{
"restaurant": {
"\_id": "...",
"restaurantName": "Pizza Palace"
}
}

Used for:

- Restaurant Information
- Tracking Header

---

Order Timeline

Field:

{
"statusTimeline": [
{
"status": "ASSIGNED",
"changedAt": "..."
}
]
}

Used for:

- Timeline UI
- Order Progress UI

---

Socket.IO Events

Room Name:

orderId

Example:

6a19652504a8565150d4a04d

---

Join Room

Event:

socket.emit(
"join-order-room",
orderId
);

---

Live Location Update

Event:

socket.on(
"live-location-updated",
(data) => {
console.log(data);
}
);

Payload:

{
"orderId": "6a19652504a8565150d4a04d",
"lat": 19.0765,
"lng": 72.878
}

---

Order Assigned

Event:

socket.on(
"order-assigned",
(data) => {}
);

---

Order Picked Up

Event:

socket.on(
"order-picked-up",
(data) => {}
);

---

Out For Delivery

Event:

socket.on(
"out-for-delivery",
(data) => {}
);

---

Order Delivered

Event:

socket.on(
"order-delivered",
(data) => {}
);

---

Integration Status

Backend Tracking Module Status:

✅ Complete

Includes:

- Auto Assignment
- FSM Order Flow
- GeoJSON Tracking
- Distance Calculation
- ETA Calculation
- Live Rider Tracking
- Socket.IO Realtime Events
- Tracking API
- Order Timeline

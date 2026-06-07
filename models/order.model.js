import mongoose from "mongoose";

import PaymentMethod from "../enums/PaymentMethod.enum.js";
import PaymentStatus from "../enums/PaymentStatus.enum.js";
import OrderStatus from "../enums/OrderStatus.enum.js";

/*
|------------------------------------------------------------------
| ORDER ITEM SCHEMA
|------------------------------------------------------------------
*/

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
    },

    isVeg: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  },
);

/*
|------------------------------------------------------------------
| DELIVERY ADDRESS SCHEMA
|------------------------------------------------------------------
*/

const deliveryAddressSchema = new mongoose.Schema(
  {
    street: String,

    city: String,

    state: String,

    pincode: String,

    landmark: String,

    label: {
      type: String,
      enum: ["HOME", "WORK", "OTHER"],
      default: "HOME",
    },

    location: {
      lat: Number,

      lng: Number,
    },
  },
  {
    _id: false,
  },
);

/*
|------------------------------------------------------------------
| STATUS TIMELINE SCHEMA
|------------------------------------------------------------------
*/

const statusTimelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

/*
|------------------------------------------------------------------
| LIVE LOCATION SCHEMA
|------------------------------------------------------------------
*/

const liveLocationSchema = new mongoose.Schema(
  {
    lat: Number,

    lng: Number,

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

/*
|------------------------------------------------------------------
| ORDER SCHEMA
|------------------------------------------------------------------
*/

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    restaurantLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      default: null,
    },

    /*
    |------------------------------------------------------------------
    | DELIVERY TIMESTAMPS
    |------------------------------------------------------------------
    */

    assignedAt: {
      type: Date,
      default: null,
    },

    pickedUpAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    /*
    |------------------------------------------------------------------
    | ORDER ITEMS
    |------------------------------------------------------------------
    */

    items: [orderItemSchema],

    /*
    |------------------------------------------------------------------
    | DELIVERY ADDRESS
    |------------------------------------------------------------------
    */

    deliveryAddress: deliveryAddressSchema,

    /*
    |------------------------------------------------------------------
    | PAYMENT DETAILS
    |------------------------------------------------------------------
    */

    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),

      // enum: ["COD", "UPI", "CARD", "NET_BANKING", "WALLET"],

      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      // enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],

      default: "PENDING",
    },

    paymentGateway: {
      type: String,

      enum: ["RAZORPAY", "STRIPE", "PAYPAL", null],

      default: null,
    },

    paymentId: {
      type: String,
      default: null,
    },

    gatewayOrderId: {
      type: String,
      default: null,
    },

    gatewayPaymentId: {
      type: String,
      default: null,
    },

    paymentFailureReason: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    refundAt: {
      type: Date,
      default: null,
    },

    /*
    |------------------------------------------------------------------
    | ORDER STATUS
    |------------------------------------------------------------------
    */

    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PLACED,
    },

    /*
    |------------------------------------------------------------------
    | STATUS TIMELINE
    |------------------------------------------------------------------
    */

    statusTimeline: [statusTimelineSchema],

    /*
    |------------------------------------------------------------------
    | LIVE TRACKING
    |------------------------------------------------------------------
    */

    liveLocation: {
      type: liveLocationSchema,
      default: null,
    },

    /*
    |------------------------------------------------------------------
    | BILLING
    |------------------------------------------------------------------
    */

    subtotal: {
      type: Number,
      required: true,
    },

    deliveryFee: {
      type: Number,
      default: 0,
    },

    taxes: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    estimatedDeliveryTime: {
      type: Number,
      default: 30,
    },
  },
  {
    timestamps: true,
  },
);

/*
|------------------------------------------------------------------
| GEO INDEX
|------------------------------------------------------------------
*/

orderSchema.index({
  restaurantLocation: "2dsphere",
});

const Order = mongoose.model("Order", orderSchema);

export default Order;

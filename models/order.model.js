// models/order.model.js

import mongoose from "mongoose";

// ======================================================
// ORDER ITEM SCHEMA
// ======================================================

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
      trim: true,
    },

    image: String,

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
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

// ======================================================
// ORDER SCHEMA
// ======================================================

const orderSchema = new mongoose.Schema(
  {
    // ORDER ID
    orderId: {
      type: String,
      unique: true,
    },

    // CUSTOMER
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // RESTAURANT
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    // DELIVERY PARTNER
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      default: null,
    },

    // ORDER ITEMS
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(val) => val.length > 0, "Order items required"],
    },

    // DELIVERY ADDRESS
    deliveryAddress: {
      fullName: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      addressLine: {
        type: String,
        required: true,
      },

      landmark: String,

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },

      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },

        coordinates: {
          type: [Number], // [lng, lat]
          required: true,
        },
      },
    },

    // RESTAURANT LOCATION
    restaurantLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    // PAYMENT
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    // PRICE DETAILS
    itemsPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
    },

    deliveryFee: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },

    // ORDER STATUS
    orderStatus: {
      type: String,
      enum: [
        "PLACED",
        "CONFIRMED",
        "PREPARING",
        "READY_FOR_PICKUP",
        "ASSIGNED",
        "PICKED_UP",
        "ON_THE_WAY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PLACED",
    },

    // DELIVERY DETAILS
    estimatedDeliveryTime: Date,

    deliveredAt: Date,

    cancelledAt: Date,

    cancellationReason: String,

    // SPECIAL INSTRUCTIONS
    notes: String,

    // RATINGS
    isRated: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    review: String,
  },
  {
    timestamps: true,
  },
);

// ======================================================
// INDEXES
// ======================================================

// GEO INDEX
orderSchema.index({
  restaurantLocation: "2dsphere",
});

// CUSTOMER INDEX
orderSchema.index({
  customer: 1,
  createdAt: -1,
});

// RESTAURANT INDEX
orderSchema.index({
  restaurant: 1,
  createdAt: -1,
});

// DELIVERY PARTNER INDEX
orderSchema.index({
  deliveryPartner: 1,
  orderStatus: 1,
});

// ORDER STATUS INDEX
orderSchema.index({
  orderStatus: 1,
});

// ======================================================
// PRE SAVE HOOK
// ======================================================

orderSchema.pre("save", function (next) {
  if (!this.orderId) {
    this.orderId = `ORD-${Date.now()}`;
  }

  next();
});

// ======================================================
// MODEL
// ======================================================

const Order = mongoose.model("Order", orderSchema);

export default Order;

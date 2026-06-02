import mongoose from "mongoose";

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
    // DELIVERY PARTNER
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      default: null,
    },

    items: [orderItemSchema],

    deliveryAddress: deliveryAddressSchema,

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

    orderStatus: {
      type: String,
      enum: [
        "PLACED",
        "CONFIRMED",
        "PREPARING",
        "READY_FOR_PICKUP", // Food ready for delivery partner
        "ASSIGNED", // Delivery partner assigned
        "PICKED_UP",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PLACED",
    },

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

const Order = mongoose.model("Order", orderSchema);

export default Order;

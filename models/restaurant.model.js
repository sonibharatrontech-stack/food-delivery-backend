import mongoose from "mongoose";

import RestaurantStatus from "../enums/RestaurantStatus.enum.js";
import RestaurantType from "../enums/RestaurantType.enum.js";
const restaurantSchema = new mongoose.Schema(
  {
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RestaurantPartner",
      required: true,
    },

    restaurantName: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    description: String,

    cuisines: [String],

    tags: [String],

    phone: String,

    email: String,

    logo: String,

    coverImage: String,

    images: [String],

    address: {
      addressLine: String,

      landmark: String,

      city: String,

      state: String,

      pincode: String,

      country: String,
    },
    isVeg: {
      type: Boolean,
      default: false,
    },
    restaurantType: {
      type: String,
      enum: Object.values(RestaurantType),
      default: "NON_VEG",
    },
    // GEO LOCATION
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number], // [lng, lat],
        required: true,
      },
    },

    // DELIVERY SETTINGS
    deliveryTime: {
      type: Number,
      default: 30,
    },

    deliveryRadius: {
      type: Number,
      default: 5,
    },

    deliveryFee: {
      type: Number,
      default: 0,
    },

    minimumOrderAmount: {
      type: Number,
      default: 0,
    },

    averageCostForTwo: Number,

    // RESTAURANT STATUS
    isOpen: {
      type: Boolean,
      default: false,
    },

    isBusy: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    acceptsOnlinePayment: {
      type: Boolean,
      default: true,
    },

    acceptsCashOnDelivery: {
      type: Boolean,
      default: true,
    },

    // RATINGS
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    totalOrders: {
      type: Number,
      default: 0,
    },

    // OPENING HOURS
    openingHours: [
      {
        day: String,

        openTime: String,

        closeTime: String,

        isClosed: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // ADMIN STATUS
    status: {
      type: String,
      enum: Object.values(RestaurantStatus),
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  },
);

restaurantSchema.index({
  location: "2dsphere",
});
restaurantSchema.index({ status: 1 });

restaurantSchema.index({ isFeatured: 1 });

restaurantSchema.index({ isOpen: 1 });

restaurantSchema.index({ cuisines: 1 });

restaurantSchema.index({ rating: -1 });

restaurantSchema.index({ restaurantName: "text" });

export default mongoose.model("Restaurant", restaurantSchema);

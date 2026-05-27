import mongoose from "mongoose";

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

    // GEO LOCATION
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number], // [lng, lat]
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
      enum: ["ACTIVE", "INACTIVE", "BLOCKED"],
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

export default mongoose.model("Restaurant", restaurantSchema);


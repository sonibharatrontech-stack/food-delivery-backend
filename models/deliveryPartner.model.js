import mongoose from "mongoose";

import VehicleType from "../enums/VehicleType.enum.js";
import DeliveryPartnerStatus from "../enums/DeliveryPartnerStatus.enum.js";

const deliveryPartnerSchema = new mongoose.Schema(
  {
    /*
    |------------------------------------------------------------------
    | USER REFERENCE
    |------------------------------------------------------------------
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    /*
    |------------------------------------------------------------------
    | PARTNER UNIQUE ID
    |------------------------------------------------------------------
    */

    partnerId: {
      type: String,
      unique: true,
    },

    /*
    |------------------------------------------------------------------
    | VEHICLE DETAILS
    |------------------------------------------------------------------
    */

    vehicleType: {
      type: String,
      enum: Object.values(VehicleType),
      required: true,
    },

    vehicleNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    drivingLicense: {
      type: String,
      required: true,
    },

    aadhaarCard: String,

    panCard: String,

    profilePhoto: String,

    /*
    |------------------------------------------------------------------
    | ONLINE STATUS
    |------------------------------------------------------------------
    */

    isOnline: {
      type: Boolean,
      default: false,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isBusy: {
      type: Boolean,
      default: false,
    },

    /*
    |------------------------------------------------------------------
    | CURRENT ACTIVE ORDER
    |------------------------------------------------------------------
    */

    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    /*
    |------------------------------------------------------------------
    | LIVE LOCATION (GeoJSON)
    |------------------------------------------------------------------
    */

    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],

        // [lng, lat]
        default: [0, 0],
      },
    },

    /*
    |------------------------------------------------------------------
    | LOCATION TRACKING
    |------------------------------------------------------------------
    */

    lastLocationUpdatedAt: {
      type: Date,
      default: null,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    /*
    |------------------------------------------------------------------
    | PERFORMANCE ANALYTICS
    |------------------------------------------------------------------
    */

    rating: {
      type: Number,
      default: 0,
    },

    totalRatings: {
      type: Number,
      default: 0,
    },

    totalDeliveries: {
      type: Number,
      default: 0,
    },

    acceptanceRate: {
      type: Number,
      default: 100,
    },

    rejectionCount: {
      type: Number,
      default: 0,
    },

    /*
    |------------------------------------------------------------------
    | EARNINGS
    |------------------------------------------------------------------
    */

    totalEarnings: {
      type: Number,
      default: 0,
    },

    walletBalance: {
      type: Number,
      default: 0,
    },

    /*
    |------------------------------------------------------------------
    | ACCOUNT STATUS
    |------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: Object.values(DeliveryPartnerStatus),
      default: "PENDING",
    },

    documentsVerified: {
      type: Boolean,
      default: false,
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

deliveryPartnerSchema.index({
  currentLocation: "2dsphere",
});

const DeliveryPartner = mongoose.model(
  "DeliveryPartner",
  deliveryPartnerSchema,
);

export default DeliveryPartner;

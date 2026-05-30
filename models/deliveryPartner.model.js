import mongoose from "mongoose";
import VehicleType from "../enums/VehicleType.enum.js";
import DeliveryPartnerStatus from "../enums/DeliveryPartnerStatus.enum.js";

const deliveryPartnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    partnerId: {
      type: String,
      unique: true,
    },

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

    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },

    lastLocationUpdatedAt: Date,

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

    totalEarnings: {
      type: Number,
      default: 0,
    },

    walletBalance: {
      type: Number,
      default: 0,
    },

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

deliveryPartnerSchema.index({
  currentLocation: "2dsphere",
});

export default mongoose.model("DeliveryPartner", deliveryPartnerSchema);

import mongoose from "mongoose";

const deliveryPartnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    vehicleType: {
      type: String,
      enum: ["BIKE", "BICYCLE", "SCOOTER"],
    },

    vehicleNumber: String,

    drivingLicense: String,

    aadhaarCard: String,

    panCard: String,

    profilePhoto: String,

    currentLocation: {
      type: {
        type: String,
        default: "Point",
      },

      coordinates: {
        type: [Number],
      },
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "BLOCKED"],
      default: "PENDING",
    },

    totalDeliveries: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 0,
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

import mongoose from "mongoose";

const restaurantPartnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    businessName: {
      type: String,
      required: true,
      trim: true,
    },

    ownerName: {
      type: String,
      required: true,
    },

    businessType: {
      type: String,
      enum: ["INDIVIDUAL", "PRIVATE_LIMITED", "PARTNERSHIP", "LLP"],
      default: "INDIVIDUAL",
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      lowercase: true,
    },

    profileImage: String,

    // BUSINESS DOCUMENTS
    documents: {
      gstCertificate: String,

      panCard: String,

      aadharCard: String,

      fssaiLicense: String,

      cancelledCheque: String,

      businessProof: String,
    },

    // BANK DETAILS
    bankDetails: {
      accountHolderName: String,

      accountNumber: String,

      ifscCode: String,

      bankName: String,
    },

    // WORKFLOW
    status: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "SUSPENDED"],
      default: "PENDING",
    },

    rejectionReason: String,

    isApproved: {
      type: Boolean,
      default: false,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: Date,

    commissionPercentage: {
      type: Number,
      default: 20,
    },

    totalRestaurants: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("RestaurantPartner", restaurantPartnerSchema);

import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    discountType: {
      type: String,
      enum: ["FLAT", "PERCENTAGE"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
    },

    minimumOrderAmount: {
      type: Number,
      default: 0,
    },

    maximumDiscount: {
      type: Number,
      default: 0,
    },

    usageLimit: {
      type: Number,
      default: 0,
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    expiryDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------
| INDEXES
|--------------------------------------------------
*/



const Coupon = mongoose.model(
  "Coupon",
  couponSchema
);

export default Coupon;
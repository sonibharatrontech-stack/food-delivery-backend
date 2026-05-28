import mongoose from "mongoose";
import Roles from "../enums/Roles.enum.js";

const addressSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
    location: {
      lat: Number,
      lng: Number,
    },
    label: {
      type: String,
      enum: ["HOME", "WORK", "OTHER"],
      default: "HOME",
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
    },

 

    roles: [
      {
        type: String,

        enum: Object.values(Roles),

        default: Roles.CUSTOMER,
      },
    ],

    profileImage: String,

    addresses: [addressSchema],

    otp: String,

    otpExpiry: Date,

    refreshToken: String,

    isVerified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    lastLogin: Date,
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;

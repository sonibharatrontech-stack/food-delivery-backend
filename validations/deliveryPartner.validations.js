// validations/deliveryPartner.validation.js

import { z } from "zod";

// ============================================
// LOCATION SCHEMA
// ============================================

const locationSchema = z.object({
  type: z.enum(["Point"]).optional(),

  coordinates: z
    .array(
      z.number({
        invalid_type_error: "Coordinates must be numbers",
      }),
    )
    .length(2, "Coordinates must contain [lng, lat]"),
});

// ============================================
// CREATE DELIVERY PARTNER SCHEMA
// ============================================

export const applyDeliveryPartnerSchema = z.object({
  vehicleType: z.enum(["BIKE", "BICYCLE", "SCOOTER"], {
    errorMap: () => ({
      message: "Invalid vehicle type",
    }),
  }),

  vehicleNumber: z
    .string()
    .trim()
    .min(5, "Vehicle number is required")
    .max(20, "Vehicle number too long")
    .transform((val) => val.toUpperCase()),

  drivingLicense: z.string().trim().min(5, "Driving license is required"),

  aadhaarCard: z.string().trim().optional(),

  panCard: z.string().trim().optional(),

  profilePhoto: z.string().url("Invalid profile photo URL").optional(),

  isOnline: z.boolean().optional(),

  isAvailable: z.boolean().optional(),

  isBusy: z.boolean().optional(),

  currentLocation: locationSchema.optional(),

  rating: z
    .number()
    .min(0, "Rating cannot be negative")
    .max(5, "Rating cannot exceed 5")
    .optional(),

  totalRatings: z
    .number()
    .min(0, "Total ratings cannot be negative")
    .optional(),

  totalDeliveries: z
    .number()
    .min(0, "Total deliveries cannot be negative")
    .optional(),

  totalEarnings: z
    .number()
    .min(0, "Total earnings cannot be negative")
    .optional(),

  walletBalance: z
    .number()
    .min(0, "Wallet balance cannot be negative")
    .optional(),

  status: z
    .enum(["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "BLOCKED"])
    .optional(),

  documentsVerified: z.boolean().optional(),
});

// ============================================
// UPDATE DELIVERY PARTNER SCHEMA
// ============================================

export const updateDeliveryPartnerSchema = applyDeliveryPartnerSchema.partial();

// ============================================
// UPDATE LOCATION SCHEMA
// ============================================

export const updateDeliveryLocationSchema = z.object({
  coordinates: z
    .array(z.number())
    .length(2, "Coordinates must contain [lng, lat]"),
});

// ============================================
// TOGGLE ONLINE STATUS SCHEMA
// ============================================

export const toggleOnlineStatusSchema = z.object({
  isOnline: z.boolean(),
});

// ============================================
// ADMIN ACTION SCHEMA
// ============================================

export const updateDeliveryPartnerStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED",
    "BLOCKED",
  ]),
});

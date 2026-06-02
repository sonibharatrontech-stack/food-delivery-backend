// validations/restaurant.validation.js

import { z } from "zod";

// ============================================
// OPENING HOURS SCHEMA
// ============================================

const openingHourSchema = z.object({
  day: z.string().min(1, "Day is required"),

  openTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid open time format"),

  closeTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid close time format"),

  isClosed: z.boolean().optional(),
});

// ============================================
// ADDRESS SCHEMA
// ============================================

const addressSchema = z.object({
  addressLine: z.string().min(5, "Address line is required").max(200),

  landmark: z.string().optional(),

  city: z.string().min(2, "City is required"),

  state: z.string().min(2, "State is required"),

  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Invalid pincode"),

  country: z.string().min(2, "Country is required"),
});

// ============================================
// CREATE RESTAURANT VALIDATION
// ============================================

export const createRestaurantSchema = z.object({
  restaurantName: z
    .string()
    .trim()
    .min(3, "Restaurant name must be at least 3 characters")
    .max(100, "Restaurant name too long"),

  description: z.string().max(1000, "Description too long").optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  cuisines: z
    .array(z.string().trim().min(1))
    .min(1, "At least one cuisine is required"),

  tags: z.array(z.string().trim()).optional(),

  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),

  email: z.string().email("Invalid email").optional(),

  logo: z.string().url("Invalid logo URL").optional(),

  coverImage: z.string().url("Invalid cover image URL").optional(),

  images: z.array(z.string().url("Invalid image URL")).optional(),

  address: addressSchema,

  isVeg: z.boolean().optional(),

  restaurantType: z.enum(["VEG", "NON_VEG", "PURE_VEG"]).optional(),

  coordinates: z
    .array(z.number())
    .length(2, "Coordinates must contain [lng, lat]"),

  deliveryTime: z
    .number()
    .min(5, "Minimum delivery time is 5 minutes")
    .max(180, "Maximum delivery time is 180 minutes")
    .optional(),

  deliveryRadius: z
    .number()
    .min(1, "Minimum delivery radius is 1 KM")
    .max(50, "Maximum delivery radius is 50 KM")
    .optional(),

  deliveryFee: z.number().min(0, "Delivery fee cannot be negative").optional(),

  minimumOrderAmount: z
    .number()
    .min(0, "Minimum order amount cannot be negative")
    .optional(),

  averageCostForTwo: z
    .number()
    .min(0, "Average cost cannot be negative")
    .optional(),

  acceptsOnlinePayment: z.boolean().optional(),

  acceptsCashOnDelivery: z.boolean().optional(),

  openingHours: z.array(openingHourSchema).min(1, "Opening hours required"),
});

// ============================================
// UPDATE RESTAURANT VALIDATION
// ============================================

export const updateRestaurantSchema = createRestaurantSchema.partial();

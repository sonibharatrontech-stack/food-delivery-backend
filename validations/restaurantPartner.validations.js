// validations/restaurantPartner.validation.js

import { z } from "zod";

export const applyRestaurantPartnerSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(3, "Business name must be at least 3 characters")
    .max(100),

  ownerName: z
    .string()
    .trim()
    .min(3, "Owner name must be at least 3 characters")
    .max(50),

  businessType: z.enum(["INDIVIDUAL", "PRIVATE_LIMITED", "PARTNERSHIP", "LLP"]),

  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),

  email: z.string().email("Invalid email").toLowerCase().optional(),

  profileImage: z.string().url("Profile image must be valid URL").optional(),

  documents: z.object({
    gstCertificate: z.string().optional(),

    panCard: z
      .string()
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN card number"),

    aadharCard: z.string().regex(/^\d{12}$/, "Invalid Aadhaar number"),

    fssaiLicense: z.string().optional(),

    cancelledCheque: z.string().optional(),

    businessProof: z.string().optional(),
  }),

  bankDetails: z.object({
    accountHolderName: z.string().trim().min(2, "Account holder name required"),

    accountNumber: z.string().regex(/^\d{9,18}$/, "Invalid account number"),

    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),

    bankName: z.string().trim().min(2, "Bank name required"),
  }),
});

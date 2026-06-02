import { z } from "zod";

// ============================================
// CREATE MENU ITEM VALIDATION
// ============================================

export const createMenuSchema = z.object({
  restaurant: z.string().min(1, "Restaurant ID is required"),

  name: z
    .string()
    .trim()
    .min(2, "Menu item name must be at least 2 characters")
    .max(100, "Menu item name is too long"),

  category: z
    .string()
    .trim()
    .min(2, "Category is required")
    .max(50, "Category is too long"),

  description: z
    .string()
    .trim()
    .min(5, "Description is required")
    .max(500, "Description is too long"),

  price: z.coerce.number().min(0, "Price cannot be negative"),

  image: z.string().url("Invalid image URL"),

  isVeg: z.boolean().optional(),

  isBestseller: z.boolean().optional(),

  rating: z.coerce
    .number()
    .min(0, "Rating cannot be less than 0")
    .max(5, "Rating cannot be greater than 5")
    .optional(),

  isAvailable: z.boolean().optional(),

  preparationTime: z.coerce
    .number()
    .min(1, "Preparation time must be at least 1 minute")
    .max(180, "Preparation time cannot exceed 180 minutes")
    .optional(),

  discountPercentage: z.coerce
    .number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%")
    .optional(),

  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).optional(),
});

// ============================================
// UPDATE MENU ITEM VALIDATION
// ============================================

export const updateMenuSchema = createMenuSchema.partial();

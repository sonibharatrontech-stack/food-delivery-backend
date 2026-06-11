// routes/restaurantPartner.routes.js

import express from "express";

import {
  applyRestaurantPartner,
  getMyPartnerProfile,
  updatePartnerProfile,
} from "../controllers/restaurantPartner.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

import roleMiddleware from "../middlewares/role.middleware.js";

import Roles from "../enums/Roles.enum.js";
import { applyRestaurantPartnerSchema } from "../validations/restaurantPartner.validations.js";
import validate from "../middlewares/validate.middleware.js";
const router = express.Router();

// ======================================================
// PARTNER ROUTES
// ======================================================

// APPLY AS RESTAURANT PARTNER
router.post(
  "/apply",
  validate(applyRestaurantPartnerSchema),
  authMiddleware,
  roleMiddleware(Roles.CUSTOMER),
  applyRestaurantPartner,
);

// GET MY PARTNER PROFILE
router.get(
  "/getmyprofile",
  authMiddleware,
  roleMiddleware(Roles.RESTAURANT_PARTNER),
  getMyPartnerProfile,
);

// UPDATE MY PARTNER PROFILE
router.put(
  "/updateprofile",
  authMiddleware,
  roleMiddleware(Roles.RESTAURANT_PARTNER),
  updatePartnerProfile,
);

export default router;

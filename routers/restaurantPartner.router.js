// routes/restaurantPartner.routes.js

import express from "express";

import {
  applyRestaurantPartner,
  getMyPartnerProfile,
  updatePartnerProfile,
  getPendingPartners,
  approvePartner,
  rejectPartner,
  suspendPartner,
  getAllPartners,
  getPartnerDetails,
  deletePartner,
} from "../controllers/restaurantPartner.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

import roleMiddleware from "../middlewares/role.middleware.js";

import Roles from "../enums/Roles.enum.js";

const router = express.Router();

// ======================================================
// PARTNER ROUTES
// ======================================================

// APPLY AS RESTAURANT PARTNER
router.post(
  "/apply",
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

// ======================================================
// ADMIN ROUTES
// ======================================================

// GET ALL PENDING PARTNER REQUESTS
router.get(
  "/pending",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.MASTER),
  getPendingPartners,
);

// GET ALL PARTNERS
router.get(
  "/",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.MASTER),
  getAllPartners,
);

// GET SINGLE PARTNER DETAILS
router.get(
  "/details/:partnerId",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.MASTER),
  getPartnerDetails,
);

// APPROVE PARTNER
router.patch(
  "/approve/:partnerId",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.MASTER),
  approvePartner,
);

// REJECT PARTNER
router.patch(
  "/reject/:partnerId",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.MASTER),
  rejectPartner,
);

// SUSPEND PARTNER
router.patch(
  "/suspend/:partnerId",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.MASTER),
  suspendPartner,
);

// DELETE PARTNER
router.delete(
  "/delete/:partnerId",
  authMiddleware,
  roleMiddleware(Roles.MASTER),
  deletePartner,
);

export default router;

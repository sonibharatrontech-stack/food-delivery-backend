// routes/deliveryPartner.routes.js

import express from "express";

import {
  getAllDeliveryPartners,
  getDeliveryPartnerById,
  approveDeliveryPartner,
  rejectDeliveryPartner,
  blockDeliveryPartner,
  getPendingPartners,
  approvePartner,
  rejectPartner,
  suspendPartner,
  getAllPartners,
  getPartnerDetails,
  deletePartner,
  blockRestaurant,
  featureRestaurant,
  getRestaurantStats,
} from "../controllers/admin.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

import roleMiddleware from "../middlewares/role.middleware.js";

import validate from "../middlewares/validate.middleware.js";

import Roles from "../enums/Roles.enum.js";

const router = express.Router();

// ======================================================
// ADMIN ROUTES RESTURANT
// ======================================================

// BLOCK RESTAURANT
router.patch(
  "/restaurant/block/:restaurantId",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.MASTER),
  blockRestaurant,
);

// FEATURE / UNFEATURE RESTAURANT
router.patch(
  "/restaurant/feature/:restaurantId",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.MASTER),
  featureRestaurant,
);

// CHANGE STATUS
router.get(
  "/restaurant/restaurants-status",
  authMiddleware,
  roleMiddleware(Roles.RESTAURANT_PARTNER, Roles.ADMIN, Roles.MASTER),
  getRestaurantStats,
);

// ======================================================
// ADMIN ROUTES RESTURANT PARTNER
// ======================================================

// GET ALL PENDING PARTNER REQUESTS
router.get(
  "/restaurant-partner/pending",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.MASTER),
  getPendingPartners,
);

// GET ALL PARTNERS
router.get(
  "/restaurant-partners",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.MASTER),
  getAllPartners,
);

// GET SINGLE PARTNER DETAILS
router.get(
  "/restaurant-partner/details/:partnerId",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.MASTER),
  getPartnerDetails,
);

// APPROVE PARTNER
router.patch(
  "/restaurant-partner/approve/:partnerId",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.MASTER),
  approvePartner,
);

// REJECT PARTNER
router.patch(
  "/restaurant-partner/reject/:partnerId",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.MASTER),
  rejectPartner,
);

// SUSPEND PARTNER
router.patch(
  "/restaurant-partner/suspend/:partnerId",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.MASTER),
  suspendPartner,
);

// DELETE PARTNER
router.delete(
  "/restaurant-partner/delete/:partnerId",
  authMiddleware,
  roleMiddleware(Roles.MASTER),
  deletePartner,
);

// ======================================================
// ADMIN ROUTES DELIVERY PARTNERS
// ======================================================

// GET ALL DELIVERY PARTNERS
router.get(
  "/delivery-partners",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.SUPER_ADMIN),
  getAllDeliveryPartners,
);

// GET SINGLE DELIVERY PARTNER
router.get(
  "/delivery-partner/:id",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.SUPER_ADMIN),
  getDeliveryPartnerById,
);

// APPROVE DELIVERY PARTNER
router.patch(
  "/delivery-partner/approve/:id",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.SUPER_ADMIN),
  approveDeliveryPartner,
);

// REJECT DELIVERY PARTNER
router.patch(
  "/delivery-partner/reject/:id",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.SUPER_ADMIN),
  rejectDeliveryPartner,
);

// BLOCK DELIVERY PARTNER
router.patch(
  "/delivery-partner/block/:id",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.SUPER_ADMIN),
  blockDeliveryPartner,
);

export default router;

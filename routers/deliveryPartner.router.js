// routes/deliveryPartner.routes.js

import express from "express";

import {
  applyDeliveryPartner,
  getMyDeliveryProfile,
  updateDeliveryPartnerProfile,
  getAllDeliveryPartners,
  getDeliveryPartnerById,
  approveDeliveryPartner,
  rejectDeliveryPartner,
  blockDeliveryPartner,
  updateLiveLocation,
  goOnline,
  goOffline,
  getAvailableOrders,
  acceptOrder,
  pickupOrder,
  outForDelivery,
  deliverOrder,
  autoAssignDeliveryPartner,
  resetTestOrder,
} from "../controllers/deliveryPartner.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

import roleMiddleware from "../middlewares/role.middleware.js";
import {
  applyDeliveryPartnerSchema,
  updateDeliveryPartnerSchema,
} from "../validations/deliveryPartner.validations.js";
import validate from "../middlewares/validate.middleware.js";

import Roles from "../enums/Roles.enum.js";

const router = express.Router();

// ======================================================
// DELIVERY PARTNER ROUTES
// ======================================================

// APPLY AS DELIVERY PARTNER
router.post(
  "/apply",
  authMiddleware,
  validate(applyDeliveryPartnerSchema),
  roleMiddleware(Roles.CUSTOMER),
  applyDeliveryPartner,
);

// GET MY DELIVERY PROFILE
router.get(
  "/getmyprofile",
  authMiddleware,
  roleMiddleware(Roles.DELIVERY_PARTNER),
  getMyDeliveryProfile,
);

// UPDATE MY PROFILE
router.put(
  "/update-profile",
  authMiddleware,
  roleMiddleware(Roles.DELIVERY_PARTNER),
  validate(updateDeliveryPartnerSchema),
  updateDeliveryPartnerProfile,
);

// UPDATE LIVE LOCATION
router.patch(
  "/location",
  authMiddleware,
  roleMiddleware(Roles.DELIVERY_PARTNER),
  updateLiveLocation,
);

// GO ONLINE
router.patch(
  "/go-online",
  authMiddleware,
  roleMiddleware(Roles.DELIVERY_PARTNER),
  goOnline,
);

// GO OFFLINE
router.patch(
  "/go-offline",
  authMiddleware,
  roleMiddleware(Roles.DELIVERY_PARTNER),
  goOffline,
);

// GET AVAILABLE ORDERS
router.get(
  "/available-orders",
  authMiddleware,
  roleMiddleware(Roles.DELIVERY_PARTNER),
  getAvailableOrders,
);

// ACCEPT ORDER
router.patch(
  "/accept-order/:orderId",
  authMiddleware,
  roleMiddleware(Roles.DELIVERY_PARTNER),
  acceptOrder,
);

/*
|------------------------------------------------------------------
| PICKUP ORDER
|------------------------------------------------------------------
*/

router.patch(
  "/pickup-order/:orderId",
  authMiddleware,
  roleMiddleware(Roles.DELIVERY_PARTNER),
  pickupOrder,
);

/*
|------------------------------------------------------------------
| OUT FOR DELIVERY
|------------------------------------------------------------------
*/

router.patch(
  "/out-for-delivery/:orderId",
  authMiddleware,
  roleMiddleware(Roles.DELIVERY_PARTNER),
  outForDelivery,
);

/*

/*
|------------------------------------------------------------------
| DELIVER ORDER
|------------------------------------------------------------------
*/

router.patch(
  "/deliver-order/:orderId",
  authMiddleware,
  roleMiddleware(Roles.DELIVERY_PARTNER),
  deliverOrder,
);

/*
|------------------------------------------------------------------
| Auto assign delivery partner
|------------------------------------------------------------------
*/
router.patch(
  "/auto-assign/:orderId",
  authMiddleware,
  roleMiddleware(Roles.DELIVERY_PARTNER),
  autoAssignDeliveryPartner,
);

/*
|------------------------------------------------------------------
| RESET TEST ORDER
|------------------------------------------------------------------
*/

router.patch(
  "/reset-order/:orderId",
  authMiddleware,
  roleMiddleware(Roles.DELIVERY_PARTNER),
  resetTestOrder,
);

// ======================================================
// ADMIN ROUTES
// ======================================================

// GET ALL DELIVERY PARTNERS
router.get(
  "/",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.SUPER_ADMIN),
  getAllDeliveryPartners,
);

// GET SINGLE DELIVERY PARTNER
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.SUPER_ADMIN),
  getDeliveryPartnerById,
);

// APPROVE DELIVERY PARTNER
router.patch(
  "/approve/:id",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.SUPER_ADMIN),
  approveDeliveryPartner,
);

// REJECT DELIVERY PARTNER
router.patch(
  "/reject/:id",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.SUPER_ADMIN),
  rejectDeliveryPartner,
);

// BLOCK DELIVERY PARTNER
router.patch(
  "/block/:id",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.SUPER_ADMIN),
  blockDeliveryPartner,
);

export default router;

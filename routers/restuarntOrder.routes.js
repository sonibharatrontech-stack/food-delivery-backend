import express from "express";
import {
  confirmOrder,
  startPreparing,
  markReadyForPickup,
} from "../controllers/resturantOrder.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

import roleMiddleware from "../middlewares/role.middleware.js";

import Roles from "../enums/Roles.enum.js";

const router = express.Router();

// ===========ORDER==============
router.patch(
  "/confirm/:orderId",
  authMiddleware,
  roleMiddleware(Roles.RESTAURANT_PARTNER, Roles.ADMIN, Roles.MASTER),
  confirmOrder,
);

router.patch(
  "/preparing/:orderId",
  authMiddleware,
  roleMiddleware(Roles.RESTAURANT_PARTNER, Roles.ADMIN, Roles.MASTER),
  startPreparing,
);

router.patch(
  "/ready/:orderId",
  authMiddleware,
  roleMiddleware(Roles.RESTAURANT_PARTNER, Roles.ADMIN, Roles.MASTER),
  markReadyForPickup,
);

export default router;

import express from "express";

import {
  getNotifications,
  markAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/get-notification/:userId", getNotifications);

router.patch("/read-notification/:id", markAsRead);

export default router;

import express from "express";

import {
  checkUser,
  logout,
  refreshAccessToken,
  register,
  sendOTP,
  verifyOTP,
} from "./auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/check-user", checkUser);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/refresh-token", refreshAccessToken);

router.post("/logout", authMiddleware, logout);

export default router;

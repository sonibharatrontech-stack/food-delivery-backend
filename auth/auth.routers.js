import express from "express";

import { checkUser, register, sendOTP, verifyOTP } from "./auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/check-user", checkUser);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

export default router;

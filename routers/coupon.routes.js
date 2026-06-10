import express from "express";

import {
  createCoupon,
  getAllCoupons,
  getActiveCoupons,
  validateCoupon,
} from "../controllers/coupon.controller.js";

const router = express.Router();

router.post("/add-coupon", createCoupon);

router.get("/get-coupons", getAllCoupons);

router.get("/active", getActiveCoupons);

router.post("/validate", validateCoupon);

export default router;

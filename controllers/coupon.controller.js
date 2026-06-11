import Coupon from "../models/coupon.model.js";

/*
|--------------------------------------------------
| CREATE COUPON
|--------------------------------------------------
*/

export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------
| GET ALL COUPONS
|--------------------------------------------------
*/

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      results: coupons.length,
      data: coupons,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------
| GET ACTIVE COUPONS
|--------------------------------------------------
*/

export const getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: {
        $gt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      results: coupons.length,
      data: coupons,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------
| VALIDATE COUPON
|--------------------------------------------------
*/

export const validateCoupon = async (req, res) => {
  try {
    const { couponCode, orderAmount } = req.body;

    const coupon = await Coupon.findOne({
      couponCode: couponCode.toUpperCase(),
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: "Coupon is inactive",
      });
    }

    if (coupon.expiryDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Coupon expired",
      });
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
      });
    }

    if (orderAmount < coupon.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${coupon.minimumOrderAmount}`,
      });
    }

    let discount = 0;

    if (coupon.discountType === "FLAT") {
      discount = coupon.discountValue;
    } else {
      discount = (orderAmount * coupon.discountValue) / 100;

      if (coupon.maximumDiscount > 0) {
        discount = Math.min(discount, coupon.maximumDiscount);
      }
    }

    const finalAmount = orderAmount - discount;

    return res.status(200).json({
      success: true,

      data: {
        couponCode: coupon.couponCode,

        discount,

        finalAmount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

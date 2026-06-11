import Restaurant from "../models/restaurant.model.js";
import RestaurantPartner from "../models/restaurantPartner.model.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { updateOrderStatus } from "../services/orderStatus.service.js";

// ===========================Orders==============================

// ---------------- CONFIRM ORDER ----------------
export const confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const updatedOrder = await updateOrderStatus({
      orderId,
      newStatus: "CONFIRMED",
    });

    return res.status(200).json({
      success: true,
      message: "Order confirmed successfully",
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------- START PREPARING ----------------
export const startPreparing = async (req, res) => {
  try {
    const { orderId } = req.params;

    const updatedOrder = await updateOrderStatus({
      orderId,
      newStatus: "PREPARING",
    });

    return res.status(200).json({
      success: true,
      message: "Order moved to preparing",
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------- READY FOR PICKUP ----------------
export const markReadyForPickup = async (req, res) => {
  try {
    const { orderId } = req.params;

    const updatedOrder = await updateOrderStatus({
      orderId,
      newStatus: "READY_FOR_PICKUP",
    });

    return res.status(200).json({
      success: true,
      message: "Order ready for pickup",
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

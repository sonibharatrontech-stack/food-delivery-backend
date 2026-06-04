import mongoose from "mongoose";

import DeliveryPartner from "../models/deliveryPartner.model.js";
import Order from "../models/order.model.js";

import { getIO } from "../socket/socket.js";

import { canTransition } from "../utils/orderStateMachine.js";

import { updateOrderStatus } from "../services/orderStatus.service.js";
import asyncHandler from "../utils/asyncHandler.js";
/*
|------------------------------------------------------------------
| APPLY DELIVERY PARTNER
|------------------------------------------------------------------
*/

export const applyDeliveryPartner = async (req, res) => {
  try {
    const {
      user,
      vehicleType,
      vehicleNumber,
      drivingLicense,
      aadhaarCard,
      panCard,
      profilePhoto,
    } = req.body;

    const existingPartner = await DeliveryPartner.findOne({
      user,
    });

    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: "User already registered as delivery partner",
      });
    }

    const partner = await DeliveryPartner.create({
      user,

      partnerId: `DP-${Date.now()}`,

      vehicleType,

      vehicleNumber,

      drivingLicense,

      aadhaarCard,

      panCard,

      profilePhoto,
    });

    return res.status(201).json({
      success: true,
      message: "Delivery partner created successfully",
      data: partner,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|------------------------------------------------------------------
| GO ONLINE
|------------------------------------------------------------------
*/

export const goOnline = async (req, res) => {
  try {
    const { partnerId } = req.body;

    const partner = await DeliveryPartner.findByIdAndUpdate(
      partnerId,
      {
        isOnline: true,
        isAvailable: true,
      },
      {
        returnDocument: "after",
      },
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Partner is now online",
      data: partner,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|------------------------------------------------------------------
| GO OFFLINE
|------------------------------------------------------------------
*/

export const goOffline = async (req, res) => {
  try {
    const { partnerId } = req.body;

    const partner = await DeliveryPartner.findByIdAndUpdate(
      partnerId,
      {
        isOnline: false,
        isAvailable: false,
      },
      {
        returnDocument: "after",
      },
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Partner is now offline",
      data: partner,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|------------------------------------------------------------------
| UPDATE LIVE LOCATION
|------------------------------------------------------------------
*/

export const updateLiveLocation = async (req, res) => {
  try {
    const { partnerId, lng, lat } = req.body;

    /*
    |------------------------------------------------------------------
    | VALIDATION
    |------------------------------------------------------------------
    */

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    /*
    |------------------------------------------------------------------
    | FIND PARTNER
    |------------------------------------------------------------------
    */

    let partner = await DeliveryPartner.findById(partnerId);

    if (
      !partner &&
      typeof partnerId === "string" &&
      partnerId.startsWith("DP-")
    ) {
      partner = await DeliveryPartner.findOne({
        partnerId,
      });
    }

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found",
      });
    }

    /*
    |------------------------------------------------------------------
    | UPDATE PARTNER LOCATION
    |------------------------------------------------------------------
    */

    partner.currentLocation = {
      type: "Point",
      coordinates: [lng, lat],
    };

    partner.lastLocationUpdatedAt = new Date();

    await partner.save();

    /*
    |------------------------------------------------------------------
    | DEBUG LOGS
    |------------------------------------------------------------------
    */

    console.log("✅ Partner:", partner.partnerId);

    console.log("📋 Current Order:", partner.currentOrder);

    console.log("📋 isBusy:", partner.isBusy);

    /*
    |------------------------------------------------------------------
    | UPDATE ORDER LIVE LOCATION
    |------------------------------------------------------------------
    */

    if (partner.currentOrder) {
      await Order.findByIdAndUpdate(partner.currentOrder, {
        liveLocation: {
          lat,
          lng,
          updatedAt: new Date(),
        },
      });
    }

    /*
    |------------------------------------------------------------------
    | SOCKET LIVE TRACKING
    |------------------------------------------------------------------
    */

    if (partner.currentOrder) {
      const io = getIO();

      const roomId = partner.currentOrder.toString();
      console.log("🚀 Emitting live-location-updated", {
        orderId: partner.currentOrder,
        lat,
        lng,
      });
      io.to(roomId).emit("live-location-updated", {
        orderId: partner.currentOrder,
        lat,
        lng,
        updatedAt: new Date(),
      });

      console.log(`📍 Live location broadcasted to room: ${roomId}`);
    } else {
      console.log("⚠️ No current order to broadcast to");
    }

    return res.status(200).json({
      success: true,
      message: "Live location updated successfully",
      data: partner.currentLocation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|------------------------------------------------------------------
| GET AVAILABLE ORDERS
|------------------------------------------------------------------
*/

export const getAvailableOrders = async (req, res) => {
  try {
    const { partnerId } = req.query;

    const partner = await DeliveryPartner.findById(partnerId);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found",
      });
    }

    const [lng, lat] = partner.currentLocation.coordinates;

    const nearbyOrders = await Order.find({
      orderStatus: "READY_FOR_PICKUP",

      deliveryPartner: null,

      restaurantLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },

          $maxDistance: 5000,
        },
      },
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      results: nearbyOrders.length,
      data: nearbyOrders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/*
|------------------------------------------------------------------
| AUTO ASSIGN DELIVERY PARTNER
|------------------------------------------------------------------
*/

export const autoAssignDeliveryPartner = async (req, res) => {
  try {
    const { orderId } = req.params;

    /*
    |------------------------------------------------------------------
    | FIND ORDER
    |------------------------------------------------------------------
    */

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /*
    |------------------------------------------------------------------
    | FSM VALIDATION
    |------------------------------------------------------------------
    */

    if (!canTransition(order.orderStatus, "ASSIGNED")) {
      return res.status(400).json({
        success: false,
        message: `Cannot move order from ${order.orderStatus} to ASSIGNED`,
      });
    }

    /*
|------------------------------------------------------------------
| DEBUGGING
|------------------------------------------------------------------
*/

    console.log("\n========== AUTO ASSIGN DEBUG ==========");

    console.log("Order ID:");
    console.log(order._id);

    console.log("\nRestaurant Location:");
    console.log(order.restaurantLocation);

    const allPartners = await DeliveryPartner.find();

    console.log("\nAll Delivery Partners:");
    console.log(JSON.stringify(allPartners, null, 2));

    console.log("\nSearching For:");
    console.log({
      isOnline: true,
      isAvailable: true,
      isBusy: false,
      coordinates: order.restaurantLocation.coordinates,
    });

    /*
    |------------------------------------------------------------------
    | FIND NEAREST PARTNER
    |------------------------------------------------------------------
    */

    const nearestPartner = await DeliveryPartner.findOne({
      isOnline: true,
      isAvailable: true,
      isBusy: false,

      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: order.restaurantLocation.coordinates,
          },

          $maxDistance: 5000,
        },
      },
    });

    console.log("\nNearest Partner Found:");
    console.log(nearestPartner);

    console.log("\n=====================================\n");
    /*
    |------------------------------------------------------------------
    | UPDATE ORDER USING SERVICE
    |------------------------------------------------------------------
    */

    const updatedOrder = await updateOrderStatus({
      orderId: order._id,

      newStatus: "ASSIGNED",

      extraFields: {
        deliveryPartner: nearestPartner._id,

        assignedAt: new Date(),
      },
    });

    /*
    |------------------------------------------------------------------
    | UPDATE PARTNER
    |------------------------------------------------------------------
    */

    nearestPartner.isBusy = true;

    nearestPartner.currentOrder = updatedOrder._id;

    await nearestPartner.save();

    /*
    |------------------------------------------------------------------
    | SOCKET EVENTS
    |------------------------------------------------------------------
    */

    const io = getIO();

    io.to(updatedOrder._id.toString()).emit("order-assigned", {
      orderId: updatedOrder._id,
      partnerId: nearestPartner._id,
      message: "Delivery partner auto assigned",
    });

    console.log(`🤖 Auto assigned partner ${nearestPartner.partnerId}`);

    return res.status(200).json({
      success: true,
      message: "Partner auto assigned successfully",

      data: {
        order: updatedOrder,
        partner: nearestPartner,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/*
|------------------------------------------------------------------
| ACCEPT ORDER
|------------------------------------------------------------------
*/

export const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const { partnerId } = req.body;

    /*
    |------------------------------------------------------------------
    | FIND PARTNER
    |------------------------------------------------------------------
    */

    const partner = await DeliveryPartner.findById(partnerId);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found",
      });
    }

    /*
    |------------------------------------------------------------------
    | CHECK BUSY
    |------------------------------------------------------------------
    */

    if (partner.isBusy) {
      return res.status(400).json({
        success: false,
        message: "Partner already handling another order",
      });
    }

    /*
    |------------------------------------------------------------------
    | FIND ORDER
    |------------------------------------------------------------------
    */

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /*
    |------------------------------------------------------------------
    | CHECK ASSIGNED
    |------------------------------------------------------------------
    */

    if (order.deliveryPartner) {
      return res.status(400).json({
        success: false,
        message: "Order already assigned",
      });
    }

    /*
    |------------------------------------------------------------------
    | UPDATE ORDER
    |------------------------------------------------------------------
    */

    order.deliveryPartner = partner._id;

    order.orderStatus = "ASSIGNED";

    order.assignedAt = new Date();

    order.statusTimeline.push({
      status: "ASSIGNED",
      changedAt: new Date(),
    });

    await order.save();

    /*
    |------------------------------------------------------------------
    | UPDATE PARTNER
    |------------------------------------------------------------------
    */

    partner.isBusy = true;

    partner.currentOrder = order._id;

    await partner.save();

    /*
    |------------------------------------------------------------------
    | SOCKET EVENTS
    |------------------------------------------------------------------
    */

    const io = getIO();

    io.to(order._id.toString()).emit("order-assigned", {
      orderId: order._id,
      partnerId: partner._id,
      message: "Delivery partner assigned",
    });

    console.log(
      `📦 Order ${order._id} assigned to partner ${partner.partnerId}`,
    );

    return res.status(200).json({
      success: true,
      message: "Order accepted successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/*
|------------------------------------------------------------------
| PICKUP ORDER
|------------------------------------------------------------------
*/

export const pickupOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    /*
    |------------------------------------------------------------------
    | FIND ORDER
    |------------------------------------------------------------------
    */

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /*
    |------------------------------------------------------------------
    | FSM VALIDATION
    |------------------------------------------------------------------
    */

    if (!canTransition(order.orderStatus, "PICKED_UP")) {
      return res.status(400).json({
        success: false,
        message: `Cannot move order from ${order.orderStatus} to PICKED_UP`,
      });
    }

    /*
    |------------------------------------------------------------------
    | UPDATE STATUS USING SERVICE
    |------------------------------------------------------------------
    */

    const updatedOrder = await updateOrderStatus({
      orderId: order._id,

      newStatus: "PICKED_UP",

      extraFields: {
        pickedUpAt: new Date(),
      },
    });

    /*
    |------------------------------------------------------------------
    | SOCKET EVENT
    |------------------------------------------------------------------
    */

    const io = getIO();

    io.to(updatedOrder._id.toString()).emit("order-picked-up", {
      orderId: updatedOrder._id,
      message: "Your order has been picked up",
    });

    console.log(`📦 Order Picked Up: ${updatedOrder._id}`);

    return res.status(200).json({
      success: true,
      message: "Order picked up successfully",

      data: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|------------------------------------------------------------------
| OUT FOR DELIVERY
|------------------------------------------------------------------
*/

export const outForDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /*
    |------------------------------------------------------------------
    | FSM VALIDATION
    |------------------------------------------------------------------
    */

    if (!canTransition(order.orderStatus, "OUT_FOR_DELIVERY")) {
      return res.status(400).json({
        success: false,
        message: `Cannot move order from ${order.orderStatus} to OUT_FOR_DELIVERY`,
      });
    }

    /*
    |------------------------------------------------------------------
    | UPDATE STATUS USING SERVICE
    |------------------------------------------------------------------
    */

    const updatedOrder = await updateOrderStatus({
      orderId: order._id,

      newStatus: "OUT_FOR_DELIVERY",
    });

    /*
    |------------------------------------------------------------------
    | SOCKET EVENT
    |------------------------------------------------------------------
    */

    const io = getIO();

    io.to(updatedOrder._id.toString()).emit("out-for-delivery", {
      orderId: updatedOrder._id,
      message: "Your order is out for delivery",
    });

    return res.status(200).json({
      success: true,
      message: "Order is now out for delivery",

      data: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/*
|------------------------------------------------------------------
| DELIVER ORDER
|------------------------------------------------------------------
*/

export const deliverOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /*
    |------------------------------------------------------------------
    | FSM VALIDATION
    |------------------------------------------------------------------
    */

    if (!canTransition(order.orderStatus, "DELIVERED")) {
      return res.status(400).json({
        success: false,
        message: `Cannot move order from ${order.orderStatus} to DELIVERED`,
      });
    }

    /*
    |------------------------------------------------------------------
    | UPDATE ORDER USING SERVICE
    |------------------------------------------------------------------
    */

    const updatedOrder = await updateOrderStatus({
      orderId: order._id,

      newStatus: "DELIVERED",

      extraFields: {
        deliveredAt: new Date(),
      },
    });

    /*
    |------------------------------------------------------------------
    | UPDATE PARTNER
    |------------------------------------------------------------------
    */

    const partner = await DeliveryPartner.findById(
      updatedOrder.deliveryPartner,
    );

    if (partner) {
      partner.isBusy = false;

      partner.isAvailable = true;

      partner.currentOrder = null;

      partner.totalDeliveries += 1;

      partner.totalEarnings += 50;

      partner.walletBalance += 50;

      await partner.save();
    }

    /*
    |------------------------------------------------------------------
    | SOCKET EVENT
    |------------------------------------------------------------------
    */

    const io = getIO();

    io.to(updatedOrder._id.toString()).emit("order-delivered", {
      orderId: updatedOrder._id,
      message: "Your order has been delivered",
    });

    return res.status(200).json({
      success: true,
      message: "Order delivered successfully",

      data: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/*
|------------------------------------------------------------------
| RESET TEST ORDER
|------------------------------------------------------------------
*/

export const resetTestOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    /*
    |------------------------------------------------------------------
    | FIND ORDER
    |------------------------------------------------------------------
    */

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /*
    |------------------------------------------------------------------
    | RESET PARTNER
    |------------------------------------------------------------------
    */

    if (order.deliveryPartner) {
      const partner = await DeliveryPartner.findById(order.deliveryPartner);

      if (partner) {
        partner.isBusy = false;

        partner.currentOrder = null;

        partner.isAvailable = true;

        await partner.save();
      }
    }

    /*
    |------------------------------------------------------------------
    | RESET ORDER
    |------------------------------------------------------------------
    */

    order.orderStatus = "READY_FOR_PICKUP";

    order.deliveryPartner = null;

    order.assignedAt = null;

    order.pickedUpAt = null;

    order.deliveredAt = null;

    order.liveLocation = null;

    order.statusTimeline = [];

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order reset successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET MY DELIVERY PROFILE

// ======================================================

export const getMyDeliveryProfile = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findOne({
    user: req.user.id,
  })
    .populate("user", "name email phone profileImage")
    .populate("currentOrder");

  if (!partner) {
    throw new ApiError(404, "Delivery partner profile not found");
  }

  return res.status(200).json({
    success: true,
    partner,
  });
});

// ======================================================
// UPDATE DELIVERY PARTNER PROFILE

// ======================================================

export const updateDeliveryPartnerProfile = asyncHandler(async (req, res) => {
  const {
    vehicleType,
    vehicleNumber,
    drivingLicense,
    aadhaarCard,
    panCard,
    profilePhoto,
  } = req.body;

  const partner = await DeliveryPartner.findOne({
    user: req.user.id,
  });

  if (!partner) {
    throw new ApiError(404, "Delivery partner not found");
  }

  // UPDATE FIELDS
  if (vehicleType) {
    partner.vehicleType = vehicleType;
  }

  if (vehicleNumber) {
    partner.vehicleNumber = vehicleNumber;
  }

  if (drivingLicense) {
    partner.drivingLicense = drivingLicense;
  }

  if (aadhaarCard) {
    partner.aadhaarCard = aadhaarCard;
  }

  if (panCard) {
    partner.panCard = panCard;
  }

  if (profilePhoto) {
    partner.profilePhoto = profilePhoto;
  }

  await partner.save();

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    partner,
  });
});

// ======================================================
// ADMIN - GET ALL DELIVERY PARTNERS

// ======================================================

export const getAllDeliveryPartners = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status, isOnline } = req.query;

  const filter = {};

  // SEARCH
  if (search?.trim()) {
    const users = await User.find({
      $or: [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ],
    }).select("_id");

    filter.user = {
      $in: users.map((user) => user._id),
    };
  }

  // STATUS FILTER
  if (status) {
    filter.status = status;
  }

  // ONLINE FILTER
  if (isOnline !== undefined) {
    filter.isOnline = isOnline === "true";
  }

  const pageNumber = Math.max(Number(page), 1);

  const limitNumber = Math.max(Number(limit), 1);

  const skip = (pageNumber - 1) * limitNumber;

  const partners = await DeliveryPartner.find(filter)
    .populate("user", "name email phone")
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(limitNumber)
    .lean();

  const totalPartners = await DeliveryPartner.countDocuments(filter);

  return res.status(200).json({
    success: true,

    totalPartners,

    currentPage: pageNumber,

    totalPages: Math.ceil(totalPartners / limitNumber),

    count: partners.length,

    partners,
  });
});

// ======================================================
// ADMIN - GET SINGLE DELIVERY PARTNER

// ======================================================

export const getDeliveryPartnerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const partner = await DeliveryPartner.findById(id)
    .populate("user", "name email phone profileImage")
    .populate("currentOrder");

  if (!partner) {
    throw new ApiError(404, "Delivery partner not found");
  }

  return res.status(200).json({
    success: true,
    partner,
  });
});

// ======================================================
// ADMIN - APPROVE DELIVERY PARTNER

// ======================================================

export const approveDeliveryPartner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const partner = await DeliveryPartner.findById(id);

  if (!partner) {
    throw new ApiError(404, "Delivery partner not found");
  }

  // ALREADY APPROVED
  if (partner.status === "APPROVED") {
    throw new ApiError(400, "Delivery partner already approved");
  }

  // UPDATE PARTNER STATUS
  partner.status = "APPROVED";

  partner.documentsVerified = true;

  await partner.save();

  // ADD DELIVERY PARTNER ROLE TO USER
  await User.findByIdAndUpdate(
    partner.user,
    {
      $addToSet: {
        roles: Roles.DELIVERY_PARTNER,
      },
    },
    {
      new: true,
    },
  );

  return res.status(200).json({
    success: true,
    message: "Delivery partner approved successfully",
    partner,
  });
});

// ======================================================
// ADMIN - REJECT DELIVERY PARTNER

// ======================================================

export const rejectDeliveryPartner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const partner = await DeliveryPartner.findById(id);

  if (!partner) {
    throw new ApiError(404, "Delivery partner not found");
  }

  partner.status = "REJECTED";

  await partner.save();

  return res.status(200).json({
    success: true,
    message: "Delivery partner rejected",
  });
});

// ======================================================
// ADMIN - BLOCK DELIVERY PARTNER

// ======================================================

export const blockDeliveryPartner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const partner = await DeliveryPartner.findById(id);

  if (!partner) {
    throw new ApiError(404, "Delivery partner not found");
  }

  partner.status = "BLOCKED";

  partner.isOnline = false;

  partner.isAvailable = false;

  partner.isBusy = false;

  await partner.save();

  // REMOVE DELIVERY PARTNER ROLE
  await User.findByIdAndUpdate(partner.user, {
    $pull: {
      roles: Roles.DELIVERY_PARTNER,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Delivery partner blocked successfully",
  });
});

import DeliveryPartner from "../models/deliveryPartner.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Roles from "../enums/Roles.enum.js";
// ======================================================
// APPLY DELIVERY PARTNER
// POST /api/delivery-partner/apply
// ======================================================

export const applyDeliveryPartner = asyncHandler(async (req, res) => {
  const {
    vehicleType,
    vehicleNumber,
    drivingLicense,
    aadhaarCard,
    panCard,
    profilePhoto,
  } = req.body;

  // CHECK USER
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // CHECK EXISTING APPLICATION
  const existingPartner = await DeliveryPartner.findOne({
    user: user._id,
  });

  if (existingPartner) {
    throw new ApiError(400, "Already applied as delivery partner");
  }

  // CREATE PARTNER
  const partner = await DeliveryPartner.create({
    user: user._id,

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
    message: "Delivery partner application submitted",
    partner,
  });
});

// ======================================================
// GET MY DELIVERY PROFILE
// GET /api/delivery-partner/me
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
// PUT /api/delivery-partner/update-profile
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
// GET /api/admin/delivery-partners
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
// GET /api/admin/delivery-partner/:id
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
// PATCH /api/admin/delivery-partner/:id/approve
// ======================================================

// ======================================================
// ADMIN - APPROVE DELIVERY PARTNER
// PATCH /api/admin/delivery-partner/:id/approve
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
// PATCH /api/admin/delivery-partner/:id/reject
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
// PATCH /api/admin/delivery-partner/:id/block
// ======================================================

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

// ============================================
// UPDATE LIVE LOCATION
// ============================================

export const updateLiveLocation = asyncHandler(async (req, res) => {
  const { lng, lat } = req.body;

  if (!lng || !lat) {
    throw new ApiError(400, "Longitude and latitude are required");
  }

  const partner = await DeliveryPartner.findOne({
    user: req.user.id,
  });

  if (!partner) {
    throw new ApiError(404, "Partner not found");
  }

  partner.currentLocation = {
    type: "Point",
    coordinates: [lng, lat],
  };

  partner.lastLocationUpdatedAt = new Date();

  await partner.save();

  return res.status(200).json({
    success: true,
    message: "Location updated successfully",
  });
});

// ============================================
// GO ONLINE
// ============================================

export const goOnline = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findOneAndUpdate(
    {
      user: req.user.id,
    },
    {
      isOnline: true,
      isAvailable: true,
    },
    {
      new: true,
    },
  );

  if (!partner) {
    throw new ApiError(404, "Delivery partner not found");
  }

  return res.status(200).json({
    success: true,
    message: "You are online now",
    partner,
  });
});

// ============================================
// GO OFFLINE
// ============================================

export const goOffline = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findOneAndUpdate(
    {
      user: req.user.id,
    },
    {
      isOnline: false,
      isAvailable: false,
    },
    {
      new: true,
    },
  );

  if (!partner) {
    throw new ApiError(404, "Delivery partner not found");
  }

  return res.status(200).json({
    success: true,
    message: "You are offline now",
    partner,
  });
});

// ============================================
// AVAILABLE ORDERS NEARBY
// ============================================

export const getAvailableOrders = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findOne({
    user: req.user.id,
  });

  if (!partner) {
    throw new ApiError(404, "Delivery partner not found");
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
  })
    .populate("customer", "name phone")
    .populate("restaurant", "restaurantName")
    .sort({
      createdAt: -1,
    });

  return res.status(200).json({
    success: true,
    count: nearbyOrders.length,
    orders: nearbyOrders,
  });
});

// ============================================
// ACCEPT ORDER
// ============================================

export const acceptOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const partner = await DeliveryPartner.findOne({
    user: req.user.id,
  });

  if (!partner) {
    throw new ApiError(404, "Delivery partner not found");
  }

  if (partner.isBusy) {
    throw new ApiError(400, "Already handling another order");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.deliveryPartner) {
    throw new ApiError(400, "Order already assigned");
  }

  order.deliveryPartner = partner._id;

  order.orderStatus = "ASSIGNED";

  await order.save();

  partner.isBusy = true;

  partner.currentOrder = order._id;

  await partner.save();

  return res.status(200).json({
    success: true,
    message: "Order accepted successfully",
    order,
  });
});

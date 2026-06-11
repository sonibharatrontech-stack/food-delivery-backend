// ======================================================
// UPDATE DELIVERY PARTNER PROFILE

import DeliveryPartner from "../models/deliveryPartner.model.js";
import ApiError from "../utils/APIError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Restaurant from "../models/restaurant.model.js";
import restaurantPartnerModel from "../models/restaurantPartner.model.js";
// ======================================================
// ADMIN -  RESTAURANT
// ======================================================

// ======================================================
// ADMIN - BLOCK RESTAURANT
// ======================================================

export const blockRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  restaurant.status = "BLOCKED";

  restaurant.isOpen = false;

  await restaurant.save();

  return res.status(200).json({
    success: true,
    message: "Restaurant blocked successfully",
  });
});

// ======================================================
// ADMIN - FEATURE RESTAURANT
// ======================================================

export const featureRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  restaurant.isFeatured = !restaurant.isFeatured;

  await restaurant.save();

  return res.status(200).json({
    success: true,
    message: restaurant.isFeatured
      ? "Restaurant featured"
      : "Restaurant unfeatured",

    isFeatured: restaurant.isFeatured,
  });
});

// ======================================================
// ADMIN - GET RESTAURANTSTATS
// ======================================================
export const getRestaurantStats = asyncHandler(async (req, res) => {
  const totalRestaurants = await Restaurant.countDocuments();

  const activeRestaurants = await Restaurant.countDocuments({
    status: "ACTIVE",
  });

  const featuredRestaurants = await Restaurant.countDocuments({
    isFeatured: true,
  });

  const openRestaurants = await Restaurant.countDocuments({
    isOpen: true,
  });

  return res.status(200).json({
    success: true,

    stats: {
      totalRestaurants,
      activeRestaurants,
      featuredRestaurants,
      openRestaurants,
    },
  });
});

// ================================================
// ADMIN ROUTES BELOW FOR RESTURANT PARTNER
// ===============================================

// ======================================================
// GET ALL PENDING PARTNERS
// ======================================================

export const getPendingPartners = asyncHandler(async (req, res) => {
  const partners = await restaurantPartnerModel
    .find({
      status: {
        $in: ["PENDING", "UNDER_REVIEW"],
      },
    })
    .populate("user", "name email phone")
    .sort({
      createdAt: -1,
    });

  return res.status(200).json({
    success: true,
    count: partners.length,
    partners,
  });
});

// ======================================================
// APPROVE PARTNER
// ======================================================

export const approvePartner = asyncHandler(async (req, res) => {
  const { partnerId } = req.params;

  const adminId = req.user._id;

  const partner = await restaurantPartnerModel.findById(partnerId);

  if (!partner) {
    throw new ApiError(404, "Restaurant partner not found");
  }

  if (partner.status === "APPROVED") {
    throw new ApiError(400, "Partner already approved");
  }

  // UPDATE PARTNER STATUS
  partner.status = "APPROVED";

  partner.isApproved = true;

  partner.approvedBy = adminId;

  partner.approvedAt = new Date();

  partner.rejectionReason = null;

  await partner.save();

  // ADD ROLE TO USER
  await User.findByIdAndUpdate(
    partner.user,
    {
      $addToSet: {
        roles: Roles.RESTAURANT_PARTNER,
      },
    },
    {
      new: true,
    },
  );

  return res.status(200).json({
    success: true,
    message: "Restaurant partner approved successfully",
    partner,
  });
});

// ======================================================
// REJECT PARTNER
// ======================================================

export const rejectPartner = asyncHandler(async (req, res) => {
  const { partnerId } = req.params;

  const { reason } = req.body;

  if (!reason?.trim()) {
    throw new ApiError(400, "Rejection reason is required");
  }

  const partner = await restaurantPartnerModel.findById(partnerId);

  if (!partner) {
    throw new ApiError(404, "Restaurant partner not found");
  }

  partner.status = "REJECTED";

  partner.isApproved = false;

  partner.rejectionReason = reason;

  await partner.save();
  // REMOVE ROLE FROM USER
  await User.findByIdAndUpdate(partner.user, {
    $pull: {
      roles: Roles.RESTAURANT_PARTNER,
    },
  });
  return res.status(200).json({
    success: true,
    message: "Restaurant partner rejected successfully",
  });
});

// ======================================================
// SUSPEND PARTNER
// ======================================================

export const suspendPartner = asyncHandler(async (req, res) => {
  const { partnerId } = req.params;

  const partner = await restaurantPartnerModel.findById(partnerId);

  if (!partner) {
    throw new ApiError(404, "Restaurant partner not found");
  }

  partner.status = "SUSPENDED";

  partner.isApproved = false;

  await partner.save();
  // REMOVE ROLE FROM USER
  await User.findByIdAndUpdate(partner.user, {
    $pull: {
      roles: Roles.RESTAURANT_PARTNER,
    },
  });
  // BLOCK ALL RESTAURANTS
  await restaurantModel.updateMany(
    {
      partner: partner._id,
    },
    {
      isOpen: false,
      status: "BLOCKED",
    },
  );

  return res.status(200).json({
    success: true,
    message: "Restaurant partner suspended successfully",
  });
});

// ======================================================
// GET ALL PARTNERS
// ======================================================

export const getAllPartners = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status } = req.query;

  const filter = {};

  // STATUS FILTER
  if (status) {
    filter.status = status;
  }

  // SEARCH FILTER
  if (search?.trim()) {
    filter.$or = [
      {
        businessName: {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        ownerName: {
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
    ];
  }

  // PAGINATION
  const pageNumber = Math.max(Number(page), 1);

  const limitNumber = Math.max(Number(limit), 1);

  const skip = (pageNumber - 1) * limitNumber;

  const partners = await restaurantPartnerModel
    .find(filter)
    .populate("user", "name email phone")
    .populate("approvedBy", "name email")
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(limitNumber)
    .lean();

  const totalPartners = await restaurantPartnerModel.countDocuments(filter);

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
// GET PARTNER DETAILS
// ======================================================

export const getPartnerDetails = asyncHandler(async (req, res) => {
  const { partnerId } = req.params;

  const partner = await restaurantPartnerModel
    .findById(partnerId)
    .populate("user", "name email phone profileImage")
    .populate("approvedBy", "name email");

  if (!partner) {
    throw new ApiError(404, "Restaurant partner not found");
  }

  // GET RESTAURANTS
  const restaurants = await restaurantModel.find({
    partner: partner._id,
  });

  return res.status(200).json({
    success: true,
    partner,
    restaurants,
  });
});

// ======================================================
// DELETE PARTNER
// ======================================================

export const deletePartner = asyncHandler(async (req, res) => {
  const { partnerId } = req.params;

  const partner = await restaurantPartnerModel.findById(partnerId);

  if (!partner) {
    throw new ApiError(404, "Restaurant partner not found");
  }

  // DELETE RESTAURANTS
  await restaurantModel.deleteMany({
    partner: partner._id,
  });

  // REMOVE PARTNER ROLE
  await User.findByIdAndUpdate(partner.user, {
    $pull: {
      roles: Roles.RESTAURANT_PARTNER,
    },
  });

  // DELETE PARTNER
  await partner.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Restaurant partner deleted successfully",
  });
});

// ======================================================
// ADMIN ROUTES BELOW FOR DELIVERY PARTNER
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

// controllers/restaurantPartner.controller.js

import restaurantPartnerModel from "../models/restaurantPartner.model.js";
import restaurantModel from "../models/restaurant.model.js";
import User from "../models/user.model.js";

import Roles from "../enums/Roles.enum.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// ======================================================
// APPLY RESTAURANT PARTNER
// ======================================================

export const applyRestaurantPartner = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const {
    businessName,
    ownerName,
    businessType,
    phone,
    email,
    profileImage,
    documents,
    bankDetails,
  } = req.body;

  // CHECK EXISTING APPLICATION
  const existingPartner = await restaurantPartnerModel.findOne({
    user: userId,
  });

  if (existingPartner) {
    throw new ApiError(400, "Application already exists");
  }

  // CREATE PARTNER
  const partner = await restaurantPartnerModel.create({
    user: userId,

    businessName,
    ownerName,
    businessType,

    phone,
    email,

    profileImage,

    documents,

    bankDetails,

    status: "PENDING",

    totalRestaurants: 0,
  });

  return res.status(201).json({
    success: true,
    message: "Restaurant partner application submitted successfully",
    partner,
  });
});

// ======================================================
// GET MY PARTNER PROFILE
// ======================================================

export const getMyPartnerProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const partner = await restaurantPartnerModel
    .findOne({
      user: userId,
    })
    .populate("user", "name email phone profileImage");

  if (!partner) {
    throw new ApiError(404, "Restaurant partner not found");
  }

  return res.status(200).json({
    success: true,
    partner,
  });
});

// ======================================================
// UPDATE PARTNER PROFILE
// ======================================================

export const updatePartnerProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const partner = await restaurantPartnerModel.findOne({
    user: userId,
  });

  if (!partner) {
    throw new ApiError(404, "Restaurant partner not found");
  }

  // PREVENT SENSITIVE FIELD UPDATE
  delete req.body.status;
  delete req.body.isApproved;
  delete req.body.approvedBy;
  delete req.body.approvedAt;
  delete req.body.rejectionReason;

  // UPDATE DATA
  Object.assign(partner, req.body);

  // MOVE TO REVIEW IF REJECTED USER UPDATES PROFILE
  if (partner.status === "REJECTED") {
    partner.status = "UNDER_REVIEW";
  }

  await partner.save();

  return res.status(200).json({
    success: true,
    message: "Partner profile updated successfully",
    partner,
  });
});

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

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


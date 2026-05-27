// controllers/restaurantPartner.controller.js

import restaurantPartnerModel from "../models/restaurantPartner.model.js";
import restaurantModel from "../models/restaurant.model.js";
import User from "../models/user.model.js";
import Roles from "../enums/Roles.enum.js";

// ================= APPLY RESTAURANT PARTNER =================
export const applyRestaurantPartner = async (req, res) => {
  try {
    console.log("REQ USER:", req.user);
    console.log("REQ BODY:", req.body);

    const userId = req.user._id;

    console.log("USER ID:", userId);

    const existingPartner = await restaurantPartnerModel.findOne({
      user: userId,
    });
    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: "Application already exists",
      });
    }
    console.log("EXISTING PARTNER:", existingPartner);

    const partner = await restaurantPartnerModel.create({
      user: userId,
      businessName: req.body.businessName,
      ownerName: req.body.ownerName,
      businessType: req.body.businessType,
      phone: req.body.phone,
      email: req.body.email,
      profileImage: req.body.profileImage,
      documents: req.body.documents,
      bankDetails: req.body.bankDetails,
      status: "PENDING",
      totalRestaurants: req.body.totalRestaurants,
    });

    console.log("PARTNER CREATED");

    return res.status(201).json({
      success: true,
      message: "Restaurant partner application submitted successfully",
      partner,
    });
  } catch (error) {
    console.error("APPLY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET MY PARTNER PROFILE =================
export const getMyPartnerProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const partner = await restaurantPartnerModel
      .findOne({
        user: userId,
      })
      .populate("user", "name email phone");

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Restaurant partner not found",
      });
    }

    return res.status(200).json({
      success: true,
      partner,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= UPDATE PARTNER PROFILE =================
export const updatePartnerProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const partner = await restaurantPartnerModel.findOne({
      user: userId,
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Restaurant partner not found",
      });
    }

    // PREVENT STATUS MANIPULATION
    delete req.body.status;
    delete req.body.isApproved;
    delete req.body.approvedBy;
    delete req.body.approvedAt;

    Object.assign(partner, req.body);

    // IF PROFILE UPDATED AGAIN
    // MOVE BACK TO REVIEW
    if (partner.status === "REJECTED") {
      partner.status = "UNDER_REVIEW";
    }

    await partner.save();

    return res.status(200).json({
      success: true,
      message: "Partner profile updated successfully",
      partner,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET ALL PENDING PARTNERS =================
export const getPendingPartners = async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= APPROVE PARTNER =================
export const approvePartner = async (req, res) => {
  try {
    const { partnerId } = req.params;

    const adminId = req.user._id;

    const partner = await restaurantPartnerModel.findById(partnerId);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Restaurant partner not found",
      });
    }

    if (partner.status === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Partner already approved",
      });
    }

    partner.status = "APPROVED";

    partner.isApproved = true;

    partner.approvedBy = adminId;

    partner.approvedAt = new Date();

    partner.rejectionReason = null;

    await partner.save();
    // ADD RESTAURANT PARTNER ROLE TO USER
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= REJECT PARTNER =================
export const rejectPartner = async (req, res) => {
  try {
    const { partnerId } = req.params;

    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }
    const partner = await restaurantPartnerModel.findById(partnerId);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Restaurant partner not found",
      });
    }

    partner.status = "REJECTED";

    partner.isApproved = false;

    partner.rejectionReason = reason;

    await partner.save();

    return res.status(200).json({
      success: true,
      message: "Restaurant partner rejected successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= SUSPEND PARTNER =================
export const suspendPartner = async (req, res) => {
  try {
    const { partnerId } = req.params;

    const partner = await restaurantPartnerModel.findById(partnerId);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Restaurant partner not found",
      });
    }

    partner.status = "SUSPENDED";

    partner.isApproved = false;

    await partner.save();

    // ALSO CLOSE ALL RESTAURANTS
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET ALL PARTNERS =================
export const getAllPartners = async (req, res) => {
  try {
    const partners = await restaurantPartnerModel
      .find()
      .populate("user", "name email phone")
      .populate("approvedBy", "name email")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: partners.length,
      partners,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET PARTNER DETAILS =================
export const getPartnerDetails = async (req, res) => {
  try {
    const { partnerId } = req.params;

    const partner = await restaurantPartnerModel
      .findById(partnerId)
      .populate("user", "name email phone")
      .populate("approvedBy", "name email");

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Restaurant partner not found",
      });
    }

    // GET PARTNER RESTAURANTS
    const restaurants = await restaurantModel.find({
      partner: partner._id,
    });

    return res.status(200).json({
      success: true,
      partner,
      restaurants,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= DELETE PARTNER =================
export const deletePartner = async (req, res) => {
  try {
    const { partnerId } = req.params;

    const partner = await restaurantPartnerModel.findById(partnerId);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Restaurant partner not found",
      });
    }

    // OPTIONAL:
    // DELETE ALL RESTAURANTS

    await restaurantModel.deleteMany({
      partner: partner._id,
    });

    await partner.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Restaurant partner deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

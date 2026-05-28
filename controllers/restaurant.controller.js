// controllers/restaurant.controller.js

import slugify from "slugify";

import Restaurant from "../models/restaurant.model.js";
import RestaurantPartner from "../models/restaurantPartner.model.js";

// ======================================================
// CREATE RESTAURANT
// ======================================================
export const createRestaurant = async (req, res) => {
  try {
    const userId = req.user._id;

    // CHECK APPROVED PARTNER
    const partner = await RestaurantPartner.findOne({
      user: userId,
      isApproved: true,
    });

    if (!partner) {
      return res.status(403).json({
        success: false,
        message: "Restaurant partner not approved",
      });
    }

    const {
      restaurantName,
      description,
      cuisines,
      tags,
      phone,
      email,
      logo,
      coverImage,
      images,
      address,
      coordinates,
      deliveryTime,
      deliveryRadius,
      deliveryFee,
      minimumOrderAmount,
      averageCostForTwo,
      openingHours,
    } = req.body;

    // VALIDATE REQUIRED FIELDS
    if (!restaurantName) {
      return res.status(400).json({
        success: false,
        message: "Restaurant name is required",
      });
    }

    // VALIDATE COORDINATES
    if (
      !coordinates ||
      !Array.isArray(coordinates) ||
      coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid coordinates are required",
      });
    }

    // GENERATE SLUG
    const slug = slugify(restaurantName, {
      lower: true,
      strict: true,
    });

    // CHECK DUPLICATE
    const existingRestaurant = await Restaurant.findOne({ slug });

    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: "Restaurant already exists",
      });
    }
    if (openingHours) {
      const { openTime, closeTime } = openingHours;
      if (openTime > closeTime) {
        return res.status(400).json({
          success: false,
          message: "Opening time cannot be later than closing time",
        });
      }
    }

    // CREATE RESTAURANT
    const restaurant = await Restaurant.create({
      partner: partner._id,

      restaurantName,
      slug,
      description,
      cuisines,
      tags,
      phone,
      email,
      logo,
      coverImage,
      images,
      address,

      location: {
        type: "Point",
        coordinates,
      },

      deliveryTime,
      deliveryRadius,
      deliveryFee,
      minimumOrderAmount,
      averageCostForTwo,
      openingHours,
    });

    // UPDATE PARTNER COUNT
    partner.totalRestaurants += 1;

    await partner.save();

    return res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      restaurant,
    });
  } catch (error) {
    console.log("CREATE RESTAURANT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET MY RESTAURANTS
// ======================================================
export const getMyRestaurants = async (req, res) => {
  try {
    const partner = await RestaurantPartner.findOne({
      user: req.user._id,
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    const restaurants = await Restaurant.find({
      partner: partner._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET SINGLE RESTAURANT
// ======================================================
export const getRestaurantById = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findById(restaurantId).populate({
      path: "partner",
      select: "businessName ownerName phone",
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET ALL RESTAURANTS
// ======================================================
export const getAllRestaurants = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      city,
      cuisine,
      isFeatured,
      isOpen,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // ================= FILTER =================

    const filter = {
      status: "ACTIVE",
    };

    // SEARCH BY NAME
    if (search) {
      filter.restaurantName = {
        $regex: search,
        $options: "i",
      };
    }

    // FILTER BY CITY
    if (city) {
      filter["address.city"] = {
        $regex: city,
        $options: "i",
      };
    }

    // FILTER BY CUISINE
    if (cuisine) {
      filter.cuisines = {
        $in: [cuisine],
      };
    }

    // FEATURED FILTER
    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === "true";
    }

    // OPEN FILTER
    if (isOpen !== undefined) {
      filter.isOpen = isOpen === "true";
    }

    // ================= PAGINATION =================

    const pageNumber = Number(page);

    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;

    // ================= SORTING =================

    const sortOptions = {
      [sortBy]: order === "asc" ? 1 : -1,
    };

    // ================= QUERY =================

    const restaurants = await Restaurant.find(filter)
      .populate({
        path: "partner",
        select: "businessName ownerName phone",
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    // ================= TOTAL COUNT =================

    const totalRestaurants = await Restaurant.countDocuments(filter);

    return res.status(200).json({
      success: true,

      totalRestaurants,

      currentPage: pageNumber,

      totalPages: Math.ceil(totalRestaurants / limitNumber),

      count: restaurants.length,

      restaurants,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ======================================================
// UPDATE RESTAURANT
// ======================================================
export const updateRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const partner = await RestaurantPartner.findOne({
      user: req.user.id,
    });

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      partner: partner._id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    Object.assign(restaurant, req.body);

    // UPDATE LOCATION
    if (req.body.coordinates) {
      restaurant.location = {
        type: "Point",
        coordinates: req.body.coordinates,
      };
    }

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// DELETE RESTAURANT
// ======================================================
export const deleteRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const partner = await RestaurantPartner.findOne({
      user: req.user.id,
    });

    const restaurant = await Restaurant.findOneAndDelete({
      _id: restaurantId,
      partner: partner._id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // UPDATE COUNT
    partner.totalRestaurants -= 1;

    await partner.save();

    return res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// TOGGLE OPEN/CLOSE
// ======================================================
export const toggleRestaurantOpenStatus = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const partner = await RestaurantPartner.findOne({
      user: req.user.id,
    });

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      partner: partner._id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    restaurant.isOpen = !restaurant.isOpen;

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: restaurant.isOpen ? "Restaurant opened" : "Restaurant closed",

      isOpen: restaurant.isOpen,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET NEARBY RESTAURANTS
// ======================================================
export const getNearbyRestaurants = async (req, res) => {
  try {
    const { lng, lat } = req.query;

    // VALIDATION
    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const restaurants = await Restaurant.find({
      status: "ACTIVE",

      isOpen: true,

      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },

          $maxDistance: 5000,
        },
      },
    })
      .select(
        "restaurantName logo coverImage cuisines rating deliveryTime location",
      )
      .limit(20);

    return res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.log("NEARBY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET FEATURED RESTAURANTS
// ======================================================
export const getFeaturedRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      isFeatured: true,
      status: "ACTIVE",
    })
      .select(
        "restaurantName logo coverImage cuisines rating deliveryTime location",
      )
      .sort({ rating: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      restaurants,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// ADMIN - BLOCK RESTAURANT
// ======================================================
export const blockRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    restaurant.status = "BLOCKED";

    restaurant.isOpen = false;

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: "Restaurant blocked successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// ADMIN - FEATURE RESTAURANT
// ======================================================
export const featureRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

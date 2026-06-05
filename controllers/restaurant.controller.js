// controllers/restaurant.controller.js

import slugify from "slugify";

import Restaurant from "../models/restaurant.model.js";
import RestaurantPartner from "../models/restaurantPartner.model.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Order from "../models/order.model.js";

// ======================================================
// CREATE RESTAURANT by Resturant Partner
// ======================================================

export const createRestaurant = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // CHECK APPROVED PARTNER
  const partner = await RestaurantPartner.findOne({
    user: userId,
    isApproved: true,
  });

  if (!partner) {
    throw new ApiError(403, "Restaurant partner not approved");
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

    isVeg,
    restaurantType,
    paymentMethods,

    coordinates,

    deliveryTime,
    deliveryRadius,
    deliveryFee,
    minimumOrderAmount,
    averageCostForTwo,

    openingHours,
  } = req.body;

  // VALIDATE REQUIRED FIELDS
  if (!restaurantName?.trim()) {
    throw new ApiError(400, "Restaurant name is required");
  }

  // VALIDATE COORDINATES
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    throw new ApiError(400, "Valid coordinates are required");
  }

  // GENERATE SLUG
  const slug = slugify(restaurantName, {
    lower: true,
    strict: true,
  });

  // CHECK DUPLICATE
  const existingRestaurant = await Restaurant.findOne({
    slug,
  });

  if (existingRestaurant) {
    throw new ApiError(400, "Restaurant already exists");
  }

  // VALIDATE OPENING HOURS
  if (Array.isArray(openingHours)) {
    for (const item of openingHours) {
      if (item.openTime && item.closeTime && item.openTime > item.closeTime) {
        throw new ApiError(
          400,
          `Opening time cannot be later than closing time for ${item.day}`,
        );
      }
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

    isVeg,
    restaurantType,

    paymentMethods,

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
    data: restaurant,
  });
});

// ======================================================
// GET MY RESTAURANTS  by Resturant Partner
// ======================================================

export const getMyRestaurants = asyncHandler(async (req, res) => {
  const partner = await RestaurantPartner.findOne({
    user: req.user._id,
  });

  if (!partner) {
    throw new ApiError(404, "Partner not found");
  }

  const restaurants = await Restaurant.find({
    partner: partner._id,
  })
    .sort({
      createdAt: -1,
    })
    .lean();

  return res.status(200).json({
    success: true,
    count: restaurants.length,
    data: restaurants,
  });
});

// ======================================================
// UPDATE RESTAURANT  by Resturant Partner
// ======================================================

export const updateRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  const partner = await RestaurantPartner.findOne({
    user: req.user.id,
  });

  if (!partner) {
    throw new ApiError(404, "Partner not found");
  }

  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    partner: partner._id,
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  Object.assign(restaurant, req.body);

  // UPDATE LOCATION
  if (req.body.coordinates) {
    restaurant.location = {
      type: "Point",
      coordinates: req.body.coordinates,
    };
  }

  // UPDATE SLUG
  if (req.body.restaurantName) {
    restaurant.slug = slugify(req.body.restaurantName, {
      lower: true,
      strict: true,
    });
  }

  await restaurant.save();

  return res.status(200).json({
    success: true,
    message: "Restaurant updated successfully",
    data: restaurant,
  });
});

// ======================================================
// DELETE RESTAURANT  by Resturant Partner
// ======================================================

export const deleteRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  const partner = await RestaurantPartner.findOne({
    user: req.user.id,
  });

  if (!partner) {
    throw new ApiError(404, "Partner not found");
  }

  const restaurant = await Restaurant.findOneAndDelete({
    _id: restaurantId,
    partner: partner._id,
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  // UPDATE COUNT
  partner.totalRestaurants -= 1;

  await partner.save();

  return res.status(200).json({
    success: true,
    message: "Restaurant deleted successfully",
  });
});

// ===================================================
// Delivery Setting Update   by Resturant Partner
// ==================================================
export const updateDeliverySettings = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  const { deliveryTime, deliveryRadius, deliveryFee, minimumOrderAmount } =
    req.body;

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  restaurant.deliveryTime = deliveryTime ?? restaurant.deliveryTime;

  restaurant.deliveryRadius = deliveryRadius ?? restaurant.deliveryRadius;

  restaurant.deliveryFee = deliveryFee ?? restaurant.deliveryFee;

  restaurant.minimumOrderAmount =
    minimumOrderAmount ?? restaurant.minimumOrderAmount;

  await restaurant.save();

  return res.status(200).json({
    success: true,
    message: "Delivery settings updated",
  });
});

// ======================================================
// TOGGLE OPEN/CLOSE  by Resturant Partner
// ======================================================

export const toggleRestaurantOpenStatus = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  const partner = await RestaurantPartner.findOne({
    user: req.user.id,
  });

  if (!partner) {
    throw new ApiError(404, "Partner not found");
  }

  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    partner: partner._id,
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  restaurant.isOpen = !restaurant.isOpen;

  await restaurant.save();

  return res.status(200).json({
    success: true,
    message: restaurant.isOpen ? "Restaurant opened" : "Restaurant closed",

    isOpen: restaurant.isOpen,
  });
});

// ======================================================
// GET SINGLE RESTAURANT by Customer
// ======================================================

export const getRestaurantById = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  const restaurant = await Restaurant.findById(restaurantId).populate({
    path: "partner",
    select: "businessName ownerName phone",
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  return res.status(200).json({
    success: true,
    data: restaurant,
  });
});

// ======================================================
// GET ALL RESTAURANTS by Customer
// ======================================================

export const getAllRestaurants = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 9,
    search,
    city,
    cuisine,
    isFeatured,
    isOpen,
    restaurantType,
    paymentMethod,
    minRating,
    maxCost,
    minCost,
    isVeg,
    sortBy,
    order,
  } = req.query;

  // ================= FILTER =================

  const filter = {
    status: "ACTIVE",
  };

  // SEARCH
  if (search?.trim()) {
    filter.restaurantName = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  // CITY FILTER
  if (city?.trim()) {
    filter["address.city"] = {
      $regex: city.trim(),
      $options: "i",
    };
  }

  // CUISINE FILTER
  if (cuisine?.trim()) {
    filter.cuisines = {
      $in: [cuisine],
    };
  }

  if (restaurantType?.trim()) {
    filter.restaurantType = restaurantType;
  }

  if (paymentMethod) {
    filter.paymentMethods = paymentMethod;
  }
  if (minRating) {
    filter.rating = {
      $gte: Number(minRating),
    };
  }

  if (minCost || maxCost) {
    filter.averageCostForTwo = {};

    if (minCost) {
      filter.averageCostForTwo.$gte = Number(minCost);
    }

    if (maxCost) {
      filter.averageCostForTwo.$lte = Number(maxCost);
    }
  }

  // FEATURED FILTER
  if (isFeatured !== undefined) {
    filter.isFeatured = isFeatured === "true";
  }

  // OPEN FILTER
  if (isOpen !== undefined) {
    filter.isOpen = isOpen === "true";
  }

  // VEG FILTER
  if (isVeg !== undefined) {
    filter.isVeg = isVeg === "true";
  }
  // ================= PAGINATION =================

  const pageNumber = Math.max(Number(page), 1);

  const limitNumber = Math.max(Number(limit), 1);

  const skip = (pageNumber - 1) * limitNumber;

  // ================= SORTING =================

  const allowedSortFields = [
    "createdAt",
    "restaurantName",
    "rating",
    "deliveryTime",
    "averageCostForTwo",
    "totalOrders",
  ];

  let sortOptions = {
    createdAt: -1,
  };

  if (sortBy && allowedSortFields.includes(sortBy)) {
    sortOptions = {
      [sortBy]: order === "asc" ? 1 : -1,
    };
  }

  // ================= QUERY =================

  const restaurants = await Restaurant.find(filter)
    .populate({
      path: "partner",
      select: "businessName ownerName phone",
    })
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNumber)
    .lean();

  // ================= TOTAL COUNT =================

  const totalRestaurants = await Restaurant.countDocuments(filter);

  return res.status(200).json({
    success: true,

    totalRestaurants,

    currentPage: pageNumber,

    totalPages: Math.ceil(totalRestaurants / limitNumber),

    count: restaurants.length,

    data: restaurants,
  });
});

// ======================================================
// TOGGLE Favourite by Customer
// ======================================================
export const toggleFavouriteRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  restaurant.isFavourite = !restaurant.isFavourite;

  await restaurant.save();

  return res.status(200).json({
    success: true,
    isFavourite: restaurant.isFavourite,
  });
});

// ====================================================
// Get Top Rated by Customer
// ====================================================
export const getTopRatedRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find({
    status: "ACTIVE",
  })
    .sort({
      rating: -1,
    })
    .limit(20)
    .lean();

  return res.status(200).json({
    success: true,
    restaurants,
  });
});

// ======================================================
// GET NEARBY RESTAURANTS by Customer
// ======================================================

export const getNearbyRestaurants = asyncHandler(async (req, res) => {
  const { lng, lat, isVeg, restaurantType, minRating, paymentMethod } =
    req.query;

  if (!lng || !lat) {
    throw new ApiError(400, "Latitude and Longitude required");
  }

  // CREATE FILTER
  const filter = {
    status: "ACTIVE",

    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },

        $maxDistance: 7000,
      },
    },
  };

  // VEG FILTER
  if (isVeg !== undefined) {
    filter.isVeg = isVeg === "true";
  }
  if (restaurantType?.trim()) {
    filter.restaurantType = restaurantType;
  }
  if (paymentMethod) {
    filter.paymentMethods = paymentMethod;
  }

  if (minRating) {
    filter.rating = {
      $gte: Number(minRating),
    };
  }
  const restaurants = await Restaurant.find(filter).lean();

  return res.status(200).json({
    success: true,
    count: restaurants.length,
    data: restaurants,
  });
});

// ======================================================
// GET FEATURED RESTAURANTS by Customer
// ======================================================

export const getFeaturedRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find({
    isFeatured: true,
    status: "ACTIVE",
  })
    .select(
      "restaurantName logo coverImage cuisines rating deliveryTime location",
    )
    .sort({
      rating: -1,
    })
    .limit(10)
    .lean();

  return res.status(200).json({
    success: true,
    data: restaurants,
  });
});

// ====================================================
// search restuarnt  by Customer
// =====================================================
export const searchRestaurants = asyncHandler(async (req, res) => {
  const { keyword } = req.query;

  const restaurants = await Restaurant.find({
    $text: {
      $search: keyword,
    },
  })
    .limit(20)
    .lean();

  return res.status(200).json({
    success: true,
    restaurants,
  });
});

// ===========================Orders==============================

// controllers/order.controller.js

export const confirmOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.orderStatus = "CONFIRMED";

  order.statusTimeline.push({
    status: "CONFIRMED",
    timestamp: new Date(),
  });

  await order.save();

  return res.status(200).json({
    success: true,
    message: "Order confirmed",
  });
});

export const startPreparingOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.orderStatus = "PREPARING";

  order.statusTimeline.push({
    status: "PREPARING",
    timestamp: new Date(),
  });

  await order.save();

  res.status(200).json({
    success: true,
    message: "Food preparation started",
  });
});

export const markOrderReady = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.orderStatus = "READY_FOR_PICKUP";

  order.statusTimeline.push({
    status: "READY_FOR_PICKUP",
    timestamp: new Date(),
  });

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order ready for pickup",
  });
});

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

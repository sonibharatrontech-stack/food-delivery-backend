// routes/restaurant.routes.js
import express from "express";
import {
  createRestaurant,
  getMyRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  toggleRestaurantOpenStatus,
  getNearbyRestaurants,
  getFeaturedRestaurants,
  blockRestaurant,
  featureRestaurant,
  getAllRestaurants,
  getRestaurantStats,
  searchRestaurants,
  getTopRatedRestaurants,
  toggleFavouriteRestaurant,
  getFavouriteRestaurants,
} from "../controllers/restaurant.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

import roleMiddleware from "../middlewares/role.middleware.js";

import Roles from "../enums/Roles.enum.js";
import {
  createRestaurantSchema,
  updateRestaurantSchema,
} from "../validations/restaurant.validations.js";
import validate from "../middlewares/validate.middleware.js";

const router = express.Router();

// ======================================================
// PUBLIC ROUTES
// ======================================================

// GET FEATURED RESTAURANTS
router.get("/featured", getFeaturedRestaurants);

// GET NEARBY RESTAURANTS
router.get("/nearby", getNearbyRestaurants);

// GET SINGLE RESTAURANT
router.get("/restaurant/:restaurantId", getRestaurantById);

// GET ALL RESTAURANTS
router.get("/get-restaurants", getAllRestaurants);
router.get("/search-restaurants", searchRestaurants);
router.get("/top-rated-restaurants", getTopRatedRestaurants);
router.get(
  "/favourites",
  authMiddleware,
  roleMiddleware(Roles.CUSTOMER),
  getFavouriteRestaurants,
);
// ======================================================
// RESTAURANT PARTNER ROUTES
// ======================================================

// CREATE RESTAURANT
router.post(
  "/create-restaurant",
  validate(createRestaurantSchema),
  authMiddleware,
  roleMiddleware(Roles.RESTAURANT_PARTNER, Roles.ADMIN, Roles.MASTER),
  createRestaurant,
);

// GET MY RESTAURANTS
router.get(
  "/my-restaurants/partner",
  authMiddleware,
  roleMiddleware(Roles.RESTAURANT_PARTNER, Roles.ADMIN, Roles.MASTER),
  getMyRestaurants,
);

// UPDATE RESTAURANT
router.put(
  "/update-restaurant/:restaurantId",
  validate(updateRestaurantSchema),
  authMiddleware,
  roleMiddleware(Roles.RESTAURANT_PARTNER, Roles.ADMIN, Roles.MASTER),
  updateRestaurant,
);

// DELETE RESTAURANT
router.delete(
  "/delete-restaurant/:restaurantId",
  authMiddleware,
  roleMiddleware(Roles.RESTAURANT_PARTNER, Roles.ADMIN, Roles.MASTER),
  deleteRestaurant,
);

// OPEN / CLOSE RESTAURANT
router.patch(
  "/toggle-status/:restaurantId",
  authMiddleware,
  roleMiddleware(Roles.RESTAURANT_PARTNER, Roles.ADMIN, Roles.MASTER),
  toggleRestaurantOpenStatus,
);

router.patch(
  "/favourite-status/:restaurantId",
  authMiddleware,
  roleMiddleware(
    Roles.RESTAURANT_PARTNER,
    Roles.ADMIN,
    Roles.MASTER,
    Roles.CUSTOMER,
  ),
  toggleFavouriteRestaurant,
);

// ======================================================
// ADMIN ROUTES
// ======================================================

// BLOCK RESTAURANT
router.patch(
  "/block/:restaurantId",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.MASTER),
  blockRestaurant,
);

// FEATURE / UNFEATURE RESTAURANT
router.patch(
  "/feature/:restaurantId",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.MASTER),
  featureRestaurant,
);

// CHANGE STATUS
router.get(
  "/restaurants-status",
  authMiddleware,
  roleMiddleware(Roles.RESTAURANT_PARTNER, Roles.ADMIN, Roles.MASTER),
  getRestaurantStats,
);

export default router;

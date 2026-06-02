// routes/reviewRoutes.js
import express from "express";
import {
  createReview,
  getAllReviews,
  getReviewById,
  getRestaurantReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  likeReview,
  reportReview,
  updateReviewStatus,
} from "../controllers/review.controller.js";

const router = express.Router();

// ─── Public Routes ───────────────────────────────────────────────────

// Get all reviews (with filters, pagination, sorting)
router.get("/get-all-reviews", getAllReviews);

// Get reviews for a specific restaurant (with rating stats)
router.get("/get-restaurant-reviews/:restaurantId", getRestaurantReviews);

// Get reviews by a specific user
router.get("/get-user-reviews/:userId", getUserReviews);

// Get single review by ID
router.get("/get-review/:id", getReviewById);

// Create a new review
router.post("/create-review", createReview);

// Update a review
router.put("/update-review/:id", updateReview);

// Delete a review
router.delete("/delete-review/:id", deleteReview);

// Like a review
router.patch("/like-review/:id", likeReview);

// Report a review
router.post("/report-review/:id", reportReview);

// Update review status (ACTIVE, HIDDEN, REPORTED)
router.patch("/update-review-status/:id", updateReviewStatus);

export default router;

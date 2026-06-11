import Review from "../models/review.model.js";
import mongoose from "mongoose";

import Order from "../models/order.model.js";
import Restaurant from "../models/restaurant.model.js";

// ─── Helpers ─────────────────────────────────────────────────────────

const buildFilter = (query) => {
  const filter = { status: { $ne: "HIDDEN" } };

  if (query.restaurant) filter.restaurant = query.restaurant;
  if (query.user) filter.user = query.user;
  if (query.rating) filter.rating = Number(query.rating);
  if (query.minRating)
    filter.rating = { ...filter.rating, $gte: Number(query.minRating) };
  if (query.status && ["ACTIVE", "REPORTED"].includes(query.status))
    filter.status = query.status;

  return filter;
};

const handleError = (res, error, statusCode = 500) => {
  console.error("Review Error:", error);
  res.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong",
  });
};

/*
|------------------------------------------------------------------
| UPDATE RESTAURANT RATING
|------------------------------------------------------------------
*/

const updateRestaurantRating = async (restaurantId) => {
  const reviews = await Review.find({
    restaurant: restaurantId,
    status: "ACTIVE",
  });

  if (!reviews.length) {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: 0,
    });

    return;
  }

  const average =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  await Restaurant.findByIdAndUpdate(restaurantId, {
    rating: Number(average.toFixed(1)),
  });
};
// ─── Create Review ───────────────────────────────────────────────────

export const createReview = async (req, res) => {
  try {
    const { user, restaurant, order, rating, comment, images } = req.body;

    /*
    |------------------------------------------------------------------
    | ORDER VALIDATION
    |------------------------------------------------------------------
    */

    if (order) {
      const orderData = await Order.findById(order);

      if (!orderData) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      /*
      |------------------------------------------------------------------
      | ONLY DELIVERED ORDERS
      |------------------------------------------------------------------
      */

      if (orderData.orderStatus !== "DELIVERED") {
        return res.status(400).json({
          success: false,
          message: "Review allowed only after delivery",
        });
      }

      /*
      |------------------------------------------------------------------
      | ORDER OWNERSHIP
      |------------------------------------------------------------------
      */

      if (orderData.customer.toString() !== user) {
        return res.status(403).json({
          success: false,
          message: "You can review only your own order",
        });
      }

      /*
      |------------------------------------------------------------------
      | DUPLICATE REVIEW CHECK
      |------------------------------------------------------------------
      */

      const existingReview = await Review.findOne({
        user,
        order,
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: "You have already reviewed this order",
        });
      }
    }

    /*
    |------------------------------------------------------------------
    | CREATE REVIEW
    |------------------------------------------------------------------
    */

    const review = await Review.create({
      user,
      restaurant,
      order: order || undefined,
      rating,
      comment,
      images: images || [],
    });

    /*
    |------------------------------------------------------------------
    | UPDATE RESTAURANT RATING
    |------------------------------------------------------------------
    */

    await updateRestaurantRating(restaurant);

    const populatedReview = await Review.findById(review._id)
      .populate(
        "restaurant",
        "restaurantName description cuisines phone email isOpen rating status",
      )
      .populate("order", "orderNumber");

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: populatedReview,
    });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// ─── Get All Reviews ─────────────────────────────────────────────────

export const getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
      ...filters
    } = req.query;

    const filter = buildFilter(filters);
    const skip = (Number(page) - 1) * Number(limit);
    const sortDirection = order === "asc" ? 1 : -1;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate(
          "restaurant",
          "restaurantName description cuisines phone email isOpen rating status",
        )
        .populate("order", "orderNumber")
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Review.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalReviews: total,
        limit: Number(limit),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ─── Get Single Review ───────────────────────────────────────────────

export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate(
        "restaurant",
        "restaurantName description cuisines phone email isOpen rating status",
      )
      .populate("order", "orderNumber");

    if (!review || review.status === "HIDDEN") {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    handleError(res, error, 404);
  }
};

// ─── Get Reviews by Restaurant ───────────────────────────────────────

export const getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;

    const filter = {
      restaurant: restaurantId,
      status: "ACTIVE",
      ...(rating && { rating: Number(rating) }),
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total, ratingStats] = await Promise.all([
      Review.find(filter)
        .populate("order")
        .populate("user", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Review.countDocuments(filter),
      Review.aggregate([
        {
          $match: {
            restaurant: new mongoose.Types.ObjectId(restaurantId),
            status: "ACTIVE",
          },
        },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]),
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRatings = 0;
    let sumRatings = 0;

    ratingStats.forEach((stat) => {
      distribution[stat._id] = stat.count;
      totalRatings += stat.count;
      sumRatings += stat._id * stat.count;
    });

    res.status(200).json({
      success: true,
      data: reviews,
      stats: {
        averageRating:
          totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : 0,
        totalReviews: totalRatings,
        distribution,
      },
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalReviews: total,
        limit: Number(limit),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ─── Get Reviews by User ─────────────────────────────────────────────

export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ user: userId, status: { $ne: "HIDDEN" } })
        .populate(
          "restaurant",
          "restaurantName description cuisines phone email isOpen rating status",
        )
        .populate("order", "orderNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Review.countDocuments({ user: userId, status: { $ne: "HIDDEN" } }),
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalReviews: total,
        limit: Number(limit),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ─── Update Review ───────────────────────────────────────────────────

export const updateReview = async (req, res) => {
  try {
    const { rating, comment, images } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (images !== undefined) review.images = images;

    review.isEdited = true;
    await review.save();

    await updateRestaurantRating(review.restaurant);

    const populatedReview = await Review.findById(review._id).populate(
      "restaurant",
      "restaurantName description cuisines phone email isOpen rating status",
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: populatedReview,
    });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// ─── Delete Review ───────────────────────────────────────────────────

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const restaurantId = review.restaurant;

    await Review.findByIdAndDelete(req.params.id);

    await updateRestaurantRating(restaurantId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ─── Like Review ─────────────────────────────────────────────────────

export const likeReview = async (req, res) => {
  try {
    console.log("Review ID:", req.params.id);
    console.log("User:", req.user);

    const { id } = req.params;

    const userId = req.user._id;

    const review = await Review.findById(id);

    console.log("Review:", review);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const alreadyLiked = review.likedBy.some(
      (user) => user.toString() === userId.toString(),
    );

    console.log("Already liked:", alreadyLiked);

    if (alreadyLiked) {
      review.likedBy = review.likedBy.filter(
        (user) => user.toString() !== userId.toString(),
      );

      review.likes -= 1;
    } else {
      review.likedBy.push(userId);

      review.likes += 1;
    }

    await review.save();

    return res.status(200).json({
      success: true,
      likes: review.likes,
      liked: !alreadyLiked,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Report Review ───────────────────────────────────────────────────

export const reportReview = async (req, res) => {
  try {
    const { reason } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: "REPORTED" },
      { new: true },
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review reported successfully",
      data: review,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ─── Update Review Status ────────────────────────────────────────────

export const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await updateRestaurantRating(review.restaurant);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Review status updated to ${status}`,
      data: review,
    });
  } catch (error) {
    handleError(res, error);
  }
};

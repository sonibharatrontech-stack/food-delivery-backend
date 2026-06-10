import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
    },

    images: [String],

    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "HIDDEN", "REPORTED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  },
);

/*
|------------------------------------------------------------------
| INDEXES
|------------------------------------------------------------------
*/

reviewSchema.index({
  restaurant: 1,
});

reviewSchema.index({
  user: 1,
});

reviewSchema.index({
  order: 1,
});

/*
|------------------------------------------------------------------
| MODEL
|------------------------------------------------------------------
*/

const Review = mongoose.model("Review", reviewSchema);

export default Review;

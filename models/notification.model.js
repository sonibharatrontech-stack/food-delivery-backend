import mongoose from "mongoose";

const notificationSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      title: {
        type: String,
        required: true,
      },

      message: {
        type: String,
        required: true,
      },

      type: {
        type: String,
        enum: [
          "ORDER",
          "DELIVERY",
          "PAYMENT",
          "COUPON",
          "SYSTEM",
        ],
        default: "SYSTEM",
      },

      isRead: {
        type: Boolean,
        default: false,
      },

      metadata: {
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
      },
    },
    {
      timestamps: true,
    }
  );

notificationSchema.index({
  user: 1,
});

notificationSchema.index({
  isRead: 1,
});

const Notification =
  mongoose.model(
    "Notification",
    notificationSchema
  );

export default Notification;
import Notification from "../models/notification.model.js";

export const createNotification = async ({
  user,
  title,
  message,
  type = "SYSTEM",
  metadata = {},
}) => {

  const notification =
    await Notification.create({
      user,
      title,
      message,
      type,
      metadata,
    });

  return notification;
};
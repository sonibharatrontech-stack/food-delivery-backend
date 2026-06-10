import Order from "../models/order.model.js";

import { canTransition } from "../utils/orderStateMachine.js";
import { createNotification } from "./notification.service.js";

/*
|------------------------------------------------------------------
| UPDATE ORDER STATUS
|------------------------------------------------------------------
*/

export const updateOrderStatus = async ({
  orderId,
  newStatus,
  extraFields = {},
}) => {
  /*
  |------------------------------------------------------------------
  | FIND ORDER
  |------------------------------------------------------------------
  */

  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  /*
  |------------------------------------------------------------------
  | ALREADY IN SAME STATE
  |------------------------------------------------------------------
  */

  if (order.orderStatus === newStatus) {
    throw new Error(`Order already in ${newStatus}`);
  }

  /*
  |------------------------------------------------------------------
  | FSM VALIDATION
  |------------------------------------------------------------------
  */

  if (!canTransition(order.orderStatus, newStatus)) {
    throw new Error(
      `Invalid transition from ${order.orderStatus} to ${newStatus}`,
    );
  }

  /*
  |------------------------------------------------------------------
  | UPDATE STATUS
  |------------------------------------------------------------------
  */

  order.orderStatus = newStatus;

  /*
  |------------------------------------------------------------------
  | EXTRA FIELDS
  |------------------------------------------------------------------
  */

  Object.assign(order, extraFields);

  /*
  |------------------------------------------------------------------
  | TIMELINE
  |------------------------------------------------------------------
  */

  order.statusTimeline.push({
    status: newStatus,
    changedAt: new Date(),
  });

  /*
  |------------------------------------------------------------------
  | SAVE
  |------------------------------------------------------------------
  */

  await order.save();

  /*
|--------------------------------------------------
| CREATE NOTIFICATION
|--------------------------------------------------
*/

  const notificationMessages = {
    CONFIRMED: {
      title: "Order Confirmed",
      message: "Restaurant has confirmed your order",
    },

    PREPARING: {
      title: "Preparing Order",
      message: "Your food is being prepared",
    },

    READY_FOR_PICKUP: {
      title: "Ready For Pickup",
      message: "Your order is ready for pickup",
    },

    ASSIGNED: {
      title: "Delivery Partner Assigned",
      message: "A delivery partner has been assigned",
    },

    PICKED_UP: {
      title: "Order Picked Up",
      message: "Your order has been picked up",
    },

    OUT_FOR_DELIVERY: {
      title: "Out For Delivery",
      message: "Your order is on the way",
    },

    DELIVERED: {
      title: "Order Delivered",
      message: "Enjoy your meal!",
    },
  };

  if (notificationMessages[newStatus]) {
    const notification = notificationMessages[newStatus];

    await createNotification({
      user: order.customer,

      title: notification.title,

      message: notification.message,

      type: "ORDER",

      metadata: {
        orderId: order._id,
      },
    });
  }

  return order;
};

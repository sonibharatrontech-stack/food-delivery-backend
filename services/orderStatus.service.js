import Order from "../models/order.model.js";

import { canTransition } from "../utils/orderStateMachine.js";

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
  | APPLY EXTRA FIELDS
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

  return order;
};

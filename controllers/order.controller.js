import Order from "../models/order.model.js";

/*
|------------------------------------------------------------------
| PLACE ORDER
|------------------------------------------------------------------
*/

export const placeOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|------------------------------------------------------------------
| GET USER ORDERS
|------------------------------------------------------------------
*/

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({
      customer: userId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|------------------------------------------------------------------
| GET SINGLE ORDER
|------------------------------------------------------------------
*/

export const getSingleOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    // ORDER NOT FOUND
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|------------------------------------------------------------------
| GET ALL ORDERS
|------------------------------------------------------------------
*/

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();

    res.status(200).json({
      success: true,
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|------------------------------------------------------------------
| UPDATE ORDER STATUS
|------------------------------------------------------------------
*/

export const updateOrderStatus = async (req, res) => {
  try {
    // GET ORDER ID
    const { id } = req.params;

    // GET STATUS FROM BODY
    const { orderStatus } = req.body;

    // FIND ORDER
    const order = await Order.findById(id);

    // ORDER NOT FOUND
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // UPDATE STATUS
    order.orderStatus = orderStatus;

    // SAVE
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|------------------------------------------------------------------
| GET ORDERS BY CUSTOMER
|------------------------------------------------------------------
*/

export const getOrdersByCustomer = async (req, res) => {
  try {
    // GET CUSTOMER ID
    const { customerId } = req.params;

    // FIND ORDERS
    const orders = await Order.find({
      customer: customerId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|------------------------------------------------------------------
| GET ORDERS BY RESTAURANT
|------------------------------------------------------------------
*/

export const getOrdersByRestaurant = async (req, res) => {
  try {
    // GET RESTAURANT ID
    const { restaurantId } = req.params;

    // FIND ORDERS
    const orders = await Order.find({
      restaurant: restaurantId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|------------------------------------------------------------------
| CANCEL ORDER
|------------------------------------------------------------------
*/

export const cancelOrder = async (req, res) => {
  try {
    // GET ORDER ID
    const { id } = req.params;

    // FIND ORDER
    const order = await Order.findById(id);

    // ORDER NOT FOUND
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // BLOCK CANCELLATION IF ORDER IS ALREADY DELIVERED OR CANCELLED
    const nonCancellableStatuses = ["DELIVERED", "CANCELLED"];

    if (nonCancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.orderStatus}`,
      });
    }

    // BLOCK CANCELLATION IF ORDER IS OUT FOR DELIVERY
    if (order.orderStatus === "OUT_FOR_DELIVERY") {
      return res.status(400).json({
        success: false,
        message: "Order is already out for delivery and cannot be cancelled",
      });
    }

    // SET STATUS TO CANCELLED
    order.orderStatus = "CANCELLED";
    order.cancelledAt = new Date();

    // SAVE
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

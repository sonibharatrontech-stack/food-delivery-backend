import Order from "../models/order.model.js";
import { calculateDistance } from "../utils/calculateDistance.js";
import { calculateETA } from "../utils/calculateETA.js";

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

/*
|------------------------------------------------------------------
| GET LIVE TRACKING
|------------------------------------------------------------------
*/

export const getLiveTracking = async (req, res) => {
  try {

    const { orderId } = req.params;

    /*
    |------------------------------------------------------------------
    | FIND ORDER
    |------------------------------------------------------------------
    */

    const order = await Order.findById(orderId)
      .populate({
        path: "deliveryPartner",
        select: `
          partnerId
          vehicleType
          vehicleNumber
          currentLocation
          isOnline
        `,
      })
      .populate({
        path: "restaurant",
        select: `
          restaurantName
        `,
      });

    /*
    |------------------------------------------------------------------
    | CHECK ORDER
    |------------------------------------------------------------------
    */

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /*
    |------------------------------------------------------------------
    | DISTANCE & ETA CALCULATION
    |------------------------------------------------------------------
    */

    let distanceFromCustomer = null;

    let eta = null;

    if (
      order.deliveryPartner &&
      order.deliveryPartner.currentLocation &&
      order.deliveryAddress?.location
    ) {

      const [
        partnerLng,
        partnerLat,
      ] =
        order.deliveryPartner.currentLocation.coordinates;

      const {
        lat: customerLat,
        lng: customerLng,
      } =
        order.deliveryAddress.location;

      distanceFromCustomer =
        calculateDistance(
          partnerLat,
          partnerLng,
          customerLat,
          customerLng
        );

      eta =
        calculateETA(
          distanceFromCustomer
        );
    }

    /*
    |------------------------------------------------------------------
    | RESPONSE
    |------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      data: {

        orderId: order._id,

        orderStatus: order.orderStatus,

        assignedAt: order.assignedAt,

        pickedUpAt: order.pickedUpAt,

        deliveredAt: order.deliveredAt,

        estimatedDeliveryTime:
          order.estimatedDeliveryTime,

        liveLocation: order.liveLocation,

        distanceFromCustomer,

        eta,

        deliveryPartner: order.deliveryPartner,

        restaurant: order.restaurant,

        deliveryAddress: order.deliveryAddress,

        items: order.items,

        subtotal: order.subtotal,

        deliveryFee: order.deliveryFee,

        taxes: order.taxes,

        discount: order.discount,

        totalAmount: order.totalAmount,

        statusTimeline: order.statusTimeline,
      },
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
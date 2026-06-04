import express from "express";

import {
  placeOrder,
  getUserOrders,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus,
  getOrdersByCustomer,
  getOrdersByRestaurant,
  cancelOrder,
  getLiveTracking,
} from "../controllers/order.controller.js";

const router = express.Router();

/*
|------------------------------------------------------------------
| PLACE ORDER
|------------------------------------------------------------------
*/

router.post("/place-order", placeOrder);

/*
|------------------------------------------------------------------
| GET USER ORDERS
|------------------------------------------------------------------
*/

router.get("/get-orders-byuser/:userId", getUserOrders);

/*
|------------------------------------------------------------------
| GET SINGLE ORDER
|------------------------------------------------------------------
*/

router.get("/get-order/:id", getSingleOrder);
/*
|------------------------------------------------------------------
| GET all ORDER
|------------------------------------------------------------------
*/
router.get("/get-orders", getAllOrders);

/*
|------------------------------------------------------------------
| UPDATE ORDER STATUS
|------------------------------------------------------------------
*/

router.patch("/update-order-status/:id", updateOrderStatus);

/*
|------------------------------------------------------------------
| GET ORDERS BY CUSTOMER
|------------------------------------------------------------------
*/

router.get("/get-orders-bycustomer/:customerId", getOrdersByCustomer);

/*
|------------------------------------------------------------------
| GET ORDERS BY RESTAURANT
|------------------------------------------------------------------
*/

router.get("/get-orders-byrestaurant/:restaurantId", getOrdersByRestaurant);

/*
|------------------------------------------------------------------
| Cancel Order
|------------------------------------------------------------------
*/
router.patch("/cancel-order/:id", cancelOrder);

router.get("/:orderId/live-tracking", getLiveTracking);

export default router;

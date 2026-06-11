import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Menu from "../models/menu.model.js";
import Restaurant from "../models/restaurant.model.js";
import Coupon from "../models/coupon.model.js";

import { createNotification } from "../services/notification.service.js";

export const checkout = async (req, res) => {
  try {
    const { userId, paymentMethod, deliveryAddress, couponCode } = req.body;

    /*
    |--------------------------------------------------------
    | FIND ACTIVE CART
    |--------------------------------------------------------
    */

    const cart = await Cart.findOne({
      user: userId,
      status: "ACTIVE",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart is empty",
      });
    }

    /*
    |--------------------------------------------------------
    | FIND RESTAURANT
    |--------------------------------------------------------
    */

    const restaurant = await Restaurant.findById(cart.restaurant);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    /*
    |--------------------------------------------------------
    | BUILD ORDER ITEMS
    |--------------------------------------------------------
    */

    const orderItems = [];

    for (const item of cart.items) {
      const menu = await Menu.findById(item.menuItem);

      if (!menu) continue;

      orderItems.push({
        menuItem: menu._id,
        name: menu.name,
        quantity: item.quantity,
        price: item.priceAtTime,
        image: menu.image,
        isVeg: menu.isVeg,
      });
    }

    /*
|--------------------------------------------------------
| COUPON VALIDATION
|--------------------------------------------------------
*/

    let discount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        couponCode: couponCode.toUpperCase(),
      });

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Coupon not found",
        });
      }

      if (!coupon.isActive) {
        return res.status(400).json({
          success: false,
          message: "Coupon inactive",
        });
      }

      if (coupon.expiryDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Coupon expired",
        });
      }

      if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({
          success: false,
          message: "Coupon usage limit reached",
        });
      }

      if (cart.totalAmount < coupon.minimumOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount is ₹${coupon.minimumOrderAmount}`,
        });
      }

      if (coupon.discountType === "FLAT") {
        discount = coupon.discountValue;
      } else {
        discount = (cart.totalAmount * coupon.discountValue) / 100;

        if (coupon.maximumDiscount > 0) {
          discount = Math.min(discount, coupon.maximumDiscount);
        }
      }

      coupon.usedCount += 1;

      await coupon.save();
    }

    /*
|--------------------------------------------------------
| LOCATION DEBUG
|--------------------------------------------------------
*/

    console.log("\n========== CHECKOUT DEBUG ==========");

    console.log("Restaurant:");
    console.log(restaurant.restaurantName);

    console.log("\nRestaurant Location:");
    console.log(restaurant.location);

    console.log("\nRestaurant Coordinates:");
    console.log(restaurant.location.coordinates);

    console.log("\n====================================\n");

    /*
    |--------------------------------------------------------
    | CREATE ORDER
    |--------------------------------------------------------
    */

    const order = await Order.create({
      customer: userId,

      restaurant: cart.restaurant,

      restaurantLocation: {
        type: "Point",
        coordinates: restaurant.location.coordinates,
      },

      items: orderItems,

      deliveryAddress,

      paymentMethod,

      paymentStatus: "PENDING",

      orderStatus: "PLACED",

      statusTimeline: [
        {
          status: "PLACED",
          changedAt: new Date(),
        },
      ],

      subtotal: cart.subtotal,

      deliveryFee: cart.deliveryFee,

      couponCode: couponCode || null,

      discount,

      taxes: 0,

      totalAmount: cart.totalAmount - discount,
    });

    await createNotification({
      user: userId,

      title: "Order Placed",

      message: "Your order has been placed successfully",

      type: "ORDER",

      metadata: {
        orderId: order._id,
      },
    });

    /*
    |--------------------------------------------------------
    | DELETE CART
    |--------------------------------------------------------
    */

    await Cart.findByIdAndDelete(cart._id);

    /*
    |--------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------
    */

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

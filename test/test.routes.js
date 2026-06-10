import express from "express";
import mongoose from "mongoose";

import Menu from "../modules/menu/menu.model.js";
import Cart from "../modules/cart/cart.model.js";
import Order from "../modules/orders/order.model.js";
import Review from "../modules/reviews/review.model.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| MENU TEST
|--------------------------------------------------------------------------
*/

router.get("/create-menu", async (req, res) => {
  try {
    const menu = await Menu.create({
      restaurant: new mongoose.Types.ObjectId(),

      name: "Margherita Pizza",

      category: "Pizza",

      description: "Classic tomato sauce pizza",

      price: 349,

      image:
        "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",

      isVeg: true,

      isBestseller: true,

      preparationTime: 20,
    });

    res.status(201).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| CART TEST
|--------------------------------------------------------------------------
*/

router.get("/create-cart", async (req, res) => {
  try {
    const cart = await Cart.create({
      user: new mongoose.Types.ObjectId(),

      restaurant: new mongoose.Types.ObjectId(),

      items: [
        {
          menuItem: new mongoose.Types.ObjectId(),

          quantity: 2,

          priceAtTime: 349,
        },
      ],

      subtotal: 698,

      deliveryFee: 40,

      discount: 50,

      totalAmount: 688,
    });

    res.status(201).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| ORDER TEST
|--------------------------------------------------------------------------
*/

router.get("/create-order", async (req, res) => {
  try {
    const order = await Order.create({
      customer: new mongoose.Types.ObjectId(),

      restaurant: new mongoose.Types.ObjectId(),

      items: [
        {
          menuItem: new mongoose.Types.ObjectId(),

          name: "Margherita Pizza",

          quantity: 2,

          price: 349,

          image:
            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",

          isVeg: true,
        },
      ],

      deliveryAddress: {
        street: "MG Road",

        city: "Mumbai",

        state: "Maharashtra",

        pincode: "400001",

        landmark: "Near Metro Station",

        location: {
          lat: 19.076,

          lng: 72.8777,
        },

        label: "HOME",
      },

      paymentMethod: "COD",

      paymentStatus: "PENDING",

      orderStatus: "PLACED",

      subtotal: 698,

      deliveryFee: 40,

      taxes: 35,

      discount: 50,

      totalAmount: 723,

      estimatedDeliveryTime: 30,
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| REVIEW TEST
|--------------------------------------------------------------------------
*/

router.get("/create-review", async (req, res) => {
  try {
    const review = await Review.create({
      user: new mongoose.Types.ObjectId(),

      restaurant: new mongoose.Types.ObjectId(),

      order: new mongoose.Types.ObjectId(),

      rating: 5,

      comment:
        "Amazing food quality and very fast delivery. Loved the pizza!",

      images: [
        "https://images.unsplash.com/photo-1513104890138-7c749659a591",
      ],

      likes: 12,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
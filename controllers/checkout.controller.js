import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Menu from "../models/menu.model.js";
import Restaurant from "../models/restaurant.model.js";

export const checkout = async (req, res) => {
  try {
    const { userId, paymentMethod, deliveryAddress } = req.body;

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
    | CREATE ORDER
    |--------------------------------------------------------
    */

    const order = await Order.create({
      customer: userId,

      restaurant: cart.restaurant,

      restaurantLocation: {
        type: "Point",
        coordinates: restaurant.location.coordinates.coordinates,
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

      discount: cart.discount,

      taxes: 0,

      totalAmount: cart.totalAmount,
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

import Cart from "../models/cart.model.js";
import Menu from "../models/menu.model.js";
import Restaurant from "../models/restaurant.model.js";
/*
|------------------------------------------------------------------
| ADD TO CART
|------------------------------------------------------------------
*/
export const addToCart = async (req, res) => {
  try {
    const { userId, menuItem, quantity = 1 } = req.body;

    /*
    |------------------------------------------------------------------
    | FIND MENU
    |------------------------------------------------------------------
    */

    const menu = await Menu.findById(menuItem);

    console.log("========== MENU ==========");
    console.log(menu);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    /*
    |------------------------------------------------------------------
    | FIND RESTAURANT
    |------------------------------------------------------------------
    */

    console.log("Restaurant ID From Menu:");
    console.log(menu.restaurant);

    const restaurant = await Restaurant.findById(menu.restaurant);

    console.log("========== RESTAURANT ==========");
    console.log(restaurant);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const restaurantId = restaurant._id;

    console.log("================================");
    console.log("User ID:", userId);
    console.log("Restaurant ID:", restaurantId);

    /*
    |------------------------------------------------------------------
    | FIND EXISTING CART
    |------------------------------------------------------------------
    */

    let cart = await Cart.findOne({
      user: userId,
      status: "ACTIVE",
    });

    console.log("Cart Found:", cart);
    console.log("================================");

    /*
    |------------------------------------------------------------------
    | CREATE NEW CART
    |------------------------------------------------------------------
    */

    if (!cart) {
      cart = await Cart.create({
        user: userId,

        restaurant: restaurantId,

        items: [
          {
            menuItem: menu._id,
            quantity,
            priceAtTime: menu.price,
          },
        ],

        subtotal: menu.price * quantity,

        totalAmount: menu.price * quantity,
      });

      return res.status(201).json({
        success: true,
        message: "Item added to cart",
        data: cart,
      });
    }

    /*
    |------------------------------------------------------------------
    | DIFFERENT RESTAURANT CHECK
    |------------------------------------------------------------------
    */

    if (cart.restaurant.toString() !== restaurantId.toString()) {
      return res.status(400).json({
        success: false,
        message:
          "Your cart contains items from another restaurant. Please clear your cart first.",
      });
    }

    /*
    |------------------------------------------------------------------
    | CHECK IF ITEM ALREADY EXISTS
    |------------------------------------------------------------------
    */

    const existingIndex = cart.items.findIndex(
      (item) => item.menuItem.toString() === menu._id.toString(),
    );

    if (existingIndex !== -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        menuItem: menu._id,
        quantity,
        priceAtTime: menu.price,
      });
    }

    /*
    |------------------------------------------------------------------
    | RECALCULATE TOTALS
    |------------------------------------------------------------------
    */

    cart.subtotal = cart.items.reduce(
      (sum, item) => sum + item.priceAtTime * item.quantity,
      0,
    );

    cart.totalAmount = cart.subtotal + cart.deliveryFee - cart.discount;

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      data: cart,
    });
  } catch (error) {
    console.error("========== ERROR ==========");
    console.error(error);
    console.error("===========================");

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|------------------------------------------------------------------
| GET CART
|------------------------------------------------------------------
*/
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({
      user: userId,
      status: "ACTIVE",
    })
      .populate({
        path: "items.menuItem",
        select:
          "name image price category description isVeg isBestseller rating isAvailable",
      })
      .populate({
        path: "restaurant",
        select:
          "restaurantName logo paymentMethods deliveryFee minimumOrderAmount",
      });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
          restaurant: null,
          deliveryFee: 0,
          discount: 0,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: cart,
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
| UPDATE ITEM QUANTITY
|------------------------------------------------------------------
*/
export const updateCartItem = async (req, res) => {
  try {
    const { userId, menuItemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: userId, status: "ACTIVE" });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.menuItem.toString() === menuItemId,
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    // IF QUANTITY 0 OR LESS → REMOVE ITEM
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
      if (cart.items.length === 0) {
        await Cart.findByIdAndDelete(cart._id);

        return res.status(200).json({
          success: true,
          message: "Cart cleared",
        });
      }
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    // RECALCULATE TOTALS
    cart.subtotal = cart.items.reduce(
      (sum, item) => sum + item.priceAtTime * item.quantity,
      0,
    );
    cart.totalAmount = cart.subtotal + cart.deliveryFee - cart.discount;

    await cart.save();
    return res
      .status(200)
      .json({ success: true, message: "Cart updated", data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
/*
|------------------------------------------------------------------
| REMOVE SINGLE ITEM
|------------------------------------------------------------------
*/
export const removeCartItem = async (req, res) => {
  try {
    const { userId, menuItemId } = req.params;

    const cart = await Cart.findOne({ user: userId, status: "ACTIVE" });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.menuItem.toString() !== menuItemId,
    );

    if (cart.items.length === 0) {
      await Cart.findByIdAndDelete(cart._id);

      return res.status(200).json({
        success: true,
        message: "Cart cleared",
      });
    }

    // RECALCULATE TOTALS
    cart.subtotal = cart.items.reduce(
      (sum, item) => sum + item.priceAtTime * item.quantity,
      0,
    );
    cart.totalAmount = cart.subtotal + cart.deliveryFee - cart.discount;

    await cart.save();
    return res
      .status(200)
      .json({ success: true, message: "Item removed", data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/*
|------------------------------------------------------------------
| CLEAR ENTIRE CART
|------------------------------------------------------------------
*/
export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOneAndDelete({ user: userId });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    return res
      .status(200)
      .json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

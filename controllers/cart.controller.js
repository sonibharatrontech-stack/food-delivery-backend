import Cart from "../models/cart.model.js";

/*
|------------------------------------------------------------------
| ADD TO CART
|------------------------------------------------------------------
*/
export const addToCart = async (req, res) => {
  try {
    const { userId, restaurantId, menuItem, priceAtTime, quantity } = req.body;

    let cart = await Cart.findOne({ user: userId, status: "ACTIVE" });

    // CASE 1: NO CART → CREATE FRESH
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        restaurant: restaurantId,
        items: [{ menuItem, priceAtTime, quantity: quantity || 1 }],
      });
      return res
        .status(201)
        .json({ success: true, message: "Item added to cart", data: cart });
    }

    // Empty cart → allow restaurant switch
    if (cart.items.length === 0) {
      cart.restaurant = restaurantId;
    }

    // CASE 2: DIFFERENT RESTAURANT → BLOCK
    if (cart.restaurant.toString() !== restaurantId) {
      return res.status(400).json({
        success: false,
        message:
          "Your cart has items from another restaurant. Please clear your cart first.",
        existingRestaurant: cart.restaurant,
      });
    }

    // CASE 3: SAME RESTAURANT → ADD OR INCREASE QTY
    const existingIndex = cart.items.findIndex(
      (item) => item.menuItem.toString() === menuItem,
    );

    if (existingIndex !== -1) {
      cart.items[existingIndex].quantity += quantity || 1;
    } else {
      cart.items.push({ menuItem, priceAtTime, quantity: quantity || 1 });
    }

    // RECALCULATE SUBTOTAL
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
        select: "restaurantName logo",
      });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart is empty",
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

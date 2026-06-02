import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

// POST   /api/cart                              → Add item
router.post("/add-to-cart", addToCart);

// GET    /api/cart/:userId                      → Get cart
router.get("/get-cart/:userId", getCart);

// PATCH  /api/cart/:userId/items/:menuItemId    → Update quantity
router.patch("/update-cart-item/:userId/items/:menuItemId", updateCartItem);

// DELETE /api/cart/:userId/items/:menuItemId    → Remove single item
router.delete("/remove-from-cart/:userId/items/:menuItemId", removeCartItem);

// DELETE /api/cart/:userId                      → Clear entire cart
router.delete("/clear-cart/:userId", clearCart);

export default router;

import express from "express";

import {
  createMenuItem,
  getRestaurantMenu,
  getSingleMenuItem,
  updateMenuItem,
  deleteMenuItem,
  searchMenuItems,
  getAllMenus,
  searchRestaurantMenuItems,
  getMenuCategories,
  getRestaurantsByCategory,
} from "../controllers/menu.controller.js";

const router = express.Router();

/*
|------------------------------------------------------------------
| CREATE MENU ITEM
|------------------------------------------------------------------
*/

router.post("/create-menuitem", createMenuItem);

/*
|------------------------------------------------------------------
| GET RESTAURANT MENU
|------------------------------------------------------------------
*/

router.get("/get-menuitem-byrestaurant/:restaurantId", getRestaurantMenu);

/*
|------------------------------------------------------------------
| GET SINGLE MENU ITEM
|------------------------------------------------------------------
*/

router.get("/get-menuitem/:id", getSingleMenuItem);

/*
|------------------------------------------------------------------
| UPDATE MENU ITEM
|------------------------------------------------------------------
*/

router.put("/update-menuitem/:id", updateMenuItem);

/*
|------------------------------------------------------------------
| DELETE MENU ITEM
|------------------------------------------------------------------
*/

router.delete("/delete-menuitem/:id", deleteMenuItem);
// ==========search menu items by name========
// Restaurant Specific Search
router.get(
  "/restaurants/:restaurantId/menus/search",
  searchRestaurantMenuItems,
);

router.get("/menus", getAllMenus);
router.get("/menus/search", searchMenuItems);
router.get("/category", getMenuCategories);
router.get(
  "/category/:category",
  getRestaurantsByCategory
);

export default router;

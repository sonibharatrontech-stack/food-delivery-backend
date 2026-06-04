import express from "express";

import {
  createMenuItem,
  getRestaurantMenu,
  getSingleMenuItem,
  updateMenuItem,
  deleteMenuItem,
  searchMenuItems,
  getAllMenus,
  searchMenuItemsbyRestuarnt,
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
router.get("/menu-search", searchMenuItemsbyRestuarnt);

router.get("/all", getAllMenus);
router.get("/search", searchMenuItems);

export default router;

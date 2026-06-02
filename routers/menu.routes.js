import express from "express";

import {
  createMenuItem,
  getRestaurantMenu,
  getSingleMenuItem,
  updateMenuItem,
  deleteMenuItem,
  searchMenuItems,
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

// ==========search menu items by name========
router.get("/menu-search", searchMenuItems);

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

export default router;

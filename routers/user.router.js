import express from "express";

import {
  createUser,
  updateUser,
  addAddress,
  getAddresses,
  deleteAddress,
  updateAddress,
  getUserById,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/create-user", createUser);

router.get("/get-user/:id", getUserById);

router.put("/update-user/:id", updateUser);

// ==========addresss=========

router.post("/:userId/add-address", addAddress);

router.get("/:userId/get-addresses", getAddresses);

router.put("/:userId/update-address/:addressId", updateAddress);
router.delete("/:userId/delete-address/:addressId", deleteAddress);

export default router;

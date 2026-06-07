import express from "express";

import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  addAddress,
  getAddresses,
  deleteAddress,
  updateAddress,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/create-user", createUser);

router.get("/get-all-users", getAllUsers);

router.get("/get-user/:id", getUserById);

router.put("/update-user/:id", updateUser);

router.delete("/delete-user/:id", deleteUser);
// ==========addresss=========

router.post(
  "/:userId/add-address",
  addAddress
);

router.get(
  "/:userId/get-addresses",
  getAddresses
);

router.put(
  "/:userId/update-address/:addressId",
  updateAddress
);
router.delete(
  "/:userId/delete-address/:addressId",
  deleteAddress
);



export default router;

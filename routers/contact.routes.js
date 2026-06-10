import express from "express";

import {
  createContactMessage,
  getAllContactMessages,
} from "../controllers/contact.controller.js";

const router = express.Router();

router.post("/add-contact", createContactMessage);

router.get("/get-contacts", getAllContactMessages);

export default router;

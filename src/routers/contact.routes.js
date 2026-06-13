import express from "express";

import {
  createContactMessage,
  getAllContactMessages,
} from "../controllers/contact.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { createContactSchema } from "../validations/contact.validations.js";

const router = express.Router();

router.post(
  "/add-contact",
  validate(createContactSchema),

  createContactMessage,
);

router.get("/get-contacts", getAllContactMessages);

export default router;

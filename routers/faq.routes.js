import express from "express";

import { createFAQ, getFAQs } from "../controllers/faq.controller.js";

const router = express.Router();

router.post("/add-faq", createFAQ);

router.get("/get-faq", getFAQs);

export default router;

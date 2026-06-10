import express from "express";

import { getFooter, updateFooter } from "../controllers/footer.controller.js";

const router = express.Router();

router.get("/get-footer", getFooter);

router.patch("/update-footer", updateFooter);

export default router;

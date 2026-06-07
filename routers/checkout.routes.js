import express from "express";
import { checkout } from "../controllers/checkout.controller";

const router = express.Router();

/*
|------------------------------------------------------------------
| CHECKOUT
|------------------------------------------------------------------
*/

router.post("/", checkout);

export default router;

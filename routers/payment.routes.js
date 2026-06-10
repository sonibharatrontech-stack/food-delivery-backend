import express from "express";
import {
  createPaymentSession,
  dummyPaymentWebhook,
  verifyPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

/*                                                                 
| ------------------------------------------------------------------ |
| CREATE PAYMENT SESSION                                             |
| ------------------------------------------------------------------ |
*/

router.post("/create-session", createPaymentSession);

/*                                                                 |
| ------------------------------------------------------------------ |
| VERIFY PAYMENT                                                     |
| ------------------------------------------------------------------ |
| */

router.post("/verify", verifyPayment);

/*                                                                 |
| ------------------------------------------------------------------ |
| dummyPaymentWebhook                                                     |
| ------------------------------------------------------------------ |
| */
router.post("/webhook", dummyPaymentWebhook);

export default router;

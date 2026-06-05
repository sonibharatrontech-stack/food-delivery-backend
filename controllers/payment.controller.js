import {
  createPaymentSessionService,
  verifyPaymentService,
} from "./payment.service.js";

/*
|------------------------------------------------------------------
| CREATE PAYMENT SESSION
|------------------------------------------------------------------
*/

export const createPaymentSession = async (
  req,
  res
) => {
  try {

    const {
      orderId,
      paymentMethod,
    } = req.body;

    const paymentSession =
      await createPaymentSessionService({
        orderId,
        paymentMethod,
      });

    return res.status(200).json({
      success: true,
      message:
        "Payment session created successfully",
      data: paymentSession,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/*
|------------------------------------------------------------------
| VERIFY PAYMENT
|------------------------------------------------------------------
*/

export const verifyPayment = async (
  req,
  res
) => {
  try {

    const {
      orderId,
      paymentSessionId,
      paymentStatus,
    } = req.body;

    const result =
      await verifyPaymentService({
        orderId,
        paymentSessionId,
        paymentStatus,
      });

    return res.status(200).json({
      success: true,
      message:
        result.verified
          ? "Payment verified successfully"
          : "Payment failed",
      data: result,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/*
|------------------------------------------------------------------
| DUMMY PAYMENT WEBHOOK
|------------------------------------------------------------------
*/

export const dummyPaymentWebhook =
  async (req, res) => {
    try {

      const {
        paymentSessionId,
        paymentStatus,
      } = req.body;

      /*
      |-------------------------------------------------------------
      | VERIFY PAYMENT USING SERVICE
      |-------------------------------------------------------------
      */

      const result =
        await verifyPaymentService({
          paymentSessionId,
          paymentStatus,
        });

      return res.status(200).json({
        success: true,
        message:
          "Webhook processed successfully",
        data: result,
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  };


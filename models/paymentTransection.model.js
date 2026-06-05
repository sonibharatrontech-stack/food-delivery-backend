import mongoose from "mongoose";

/*
|------------------------------------------------------------------
| PAYMENT TRANSACTION SCHEMA
|------------------------------------------------------------------
*/

const paymentTransactionSchema =
  new mongoose.Schema(
    {
      /*
      |-------------------------------------------------------------
      | ORDER
      |-------------------------------------------------------------
      */

      order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
      },

      /*
      |-------------------------------------------------------------
      | CUSTOMER
      |-------------------------------------------------------------
      */

      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      /*
      |-------------------------------------------------------------
      | PAYMENT DETAILS
      |-------------------------------------------------------------
      */

      amount: {
        type: Number,
        required: true,
      },

      currency: {
        type: String,
        default: "INR",
      },

      paymentMethod: {
        type: String,
        enum: [
          "COD",
          "UPI",
          "CARD",
          "NET_BANKING",
          "WALLET",
        ],
        required: true,
      },

      gateway: {
        type: String,
        default: "DUMMY_GATEWAY",
      },

      /*
      |-------------------------------------------------------------
      | SESSION IDS
      |-------------------------------------------------------------
      */

      paymentSessionId: {
        type: String,
        required: true,
      },

      gatewayTransactionId: {
        type: String,
        default: null,
      },

      /*
      |-------------------------------------------------------------
      | STATUS
      |-------------------------------------------------------------
      */

      status: {
        type: String,
        enum: [
          "PENDING",
          "SUCCESS",
          "FAILED",
          "REFUNDED",
        ],
        default: "PENDING",
      },

      failureReason: {
        type: String,
        default: null,
      },

      /*
      |-------------------------------------------------------------
      | TIMESTAMPS
      |-------------------------------------------------------------
      */

      paidAt: {
        type: Date,
        default: null,
      },

      refundedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

const PaymentTransaction =
  mongoose.model(
    "PaymentTransaction",
    paymentTransactionSchema
  );

export default PaymentTransaction;


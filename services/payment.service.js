import Order from "../orders/order.model.js";

import {
    createDummyPaymentSession,
} from "./dummy.gateway.js";


import PaymentTransaction from "./paymentTransaction.model.js";



/*                                                                 |
| ------------------------------------------------------------------ |
| CREATE PAYMENT SESSION                                             |
| ------------------------------------------------------------------ |
| */

export const createPaymentSessionService =
    async ({
        orderId,
        paymentMethod,
    }) => {


        /*
        |-------------------------------------------------------------
        | FIND ORDER
        |-------------------------------------------------------------
        */

        const order = await Order.findById(
            orderId
        );

        if (!order) {
            throw new Error("Order not found");
        }

        /*
        |-------------------------------------------------------------
        | VALIDATE PAYMENT STATUS
        |-------------------------------------------------------------
        */

        if (order.paymentStatus === "PAID") {
            throw new Error(
                "Order already paid"
            );
        }

        /*
        |-------------------------------------------------------------
        | CREATE DUMMY PAYMENT SESSION
        |-------------------------------------------------------------
        */


        const paymentSession =
            await createDummyPaymentSession({
                orderId: order._id,
                amount: order.totalAmount,
                paymentMethod,
            });

        /*
        |-------------------------------------------------------------
        | CREATE PAYMENT TRANSACTION
        |-------------------------------------------------------------
        */

        await PaymentTransaction.create({

            order: order._id,

            customer: order.customer,

            amount: order.totalAmount,

            paymentMethod,

            paymentSessionId:
                paymentSession.paymentSessionId,

            gateway: "DUMMY_GATEWAY",

            status: "PENDING",
        });

        return paymentSession;




    };
/*                                                                 |
| ------------------------------------------------------------------ |
| VERIFY PAYMENT                                                     |
| ------------------------------------------------------------------ |
| */

export const verifyPaymentService = async ({
    paymentSessionId,
    paymentStatus,
}) => {

    /*
    |-------------------------------------------------------------
    | FIND PAYMENT TRANSACTION
    |-------------------------------------------------------------
    */

    const transaction =
        await PaymentTransaction.findOne({
            paymentSessionId,
        });

    if (!transaction) {
        throw new Error(
            "Payment transaction not found"
        );
    }

    console.log(
        "=========== Transaction ============="
    );
    console.log(transaction);

    /*
    |-------------------------------------------------------------
    | FIND ORDER
    |-------------------------------------------------------------
    */

    const order = await Order.findById(
        transaction.order
    );

    if (!order) {
        throw new Error(
            "Order not found"
        );
    }

    console.log(
        "=========== Order ============="
    );
    console.log(order);

    /*
    |-------------------------------------------------------------
    | ALREADY PROCESSED
    |-------------------------------------------------------------
    */

    if (
        transaction.status === "SUCCESS"
    ) {
        return {
            verified: true,
            alreadyProcessed: true,
        };
    }

    /*
    |-------------------------------------------------------------
    | SUCCESS PAYMENT
    |-------------------------------------------------------------
    */

    if (
        paymentStatus === "SUCCESS"
    ) {

        console.log(
            "SUCCESS PAYMENT RECEIVED"
        );

        /*
        |---------------------------------------------------------
        | UPDATE ORDER
        |---------------------------------------------------------
        */

        order.paymentStatus = "PAID";

        order.paymentId =
            paymentSessionId;

        order.paidAt =
            new Date();

        await order.save();

        console.log(
            "Order Updated Successfully"
        );

        /*
        |---------------------------------------------------------
        | UPDATE TRANSACTION
        |---------------------------------------------------------
        */

        transaction.status =
            "SUCCESS";

        transaction.paidAt =
            new Date();

        await transaction.save();

        console.log(
            "Transaction Updated Successfully"
        );

        return {
            verified: true,
            order,
        };
    }

    /*
    |-------------------------------------------------------------
    | FAILED PAYMENT
    |-------------------------------------------------------------
    */

    order.paymentStatus =
        "FAILED";

    order.paymentFailureReason =
        "Dummy payment failed";

    await order.save();

    transaction.status =
        "FAILED";

    transaction.failureReason =
        "Dummy payment failed";

    await transaction.save();

    return {
        verified: false,
        order,
    };
};
export const createDummyPaymentSession = async ({
  orderId,
  amount,
  paymentMethod,
}) => {
  /*                                                            
    | ------------------------------------------------------------- |
    | GENERATE DUMMY PAYMENT SESSION                                |
    | ------------------------------------------------------------- |
    | */

  const paymentSessionId = `PAY-${Date.now()}`;

  /*                                                            
    | ------------------------------------------------------------- |
    | RETURN MOCK PAYMENT SESSION                                   |
    | ------------------------------------------------------------- |
    | */

  return {
    paymentSessionId,

    orderId,

    amount,

    paymentMethod,

    paymentUrl: `https://dummy-gateway.biterush/pay/${paymentSessionId}`,

    expiresIn: 300,

    status: "PENDING",
  };
};

const allowedTransitions = {

  PLACED: [
    "CONFIRMED",
    "CANCELLED",
  ],

  CONFIRMED: [
    "PREPARING",
    "CANCELLED",
  ],

  PREPARING: [
    "READY_FOR_PICKUP",
    "CANCELLED",
  ],

  READY_FOR_PICKUP: [
    "ASSIGNED",
  ],

  ASSIGNED: [
    "PICKED_UP",
  ],

  PICKED_UP: [
    "OUT_FOR_DELIVERY",
  ],

  OUT_FOR_DELIVERY: [
    "DELIVERED",
  ],

  DELIVERED: [],

  CANCELLED: [],
};

export const canTransition = (
  currentStatus,
  nextStatus
) => {

  return allowedTransitions[
    currentStatus
  ]?.includes(nextStatus);

};
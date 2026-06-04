import { calculateDistance } from "../utils/calculateDistance.js";
import { calculateETA } from "../utils/calculateETA.js";

const distance = calculateDistance(19.076, 72.8777, 19.086, 72.8877);

console.log("Distance:", distance, "km");

const eta = calculateETA(distance);

console.log("ETA:", eta, "minutes");

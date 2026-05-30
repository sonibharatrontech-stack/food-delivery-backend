import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

import express from "express";
import dotenv from "dotenv";
dotenv.config();
console.log(process.env.MONGO_URI);
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./auth/auth.routers.js";
import redisClient from "./config/redis.js";
import Roles from "./enums/Roles.enum.js";
import connectDB from "./config/db.js";
import RestaurantPartnerRoutes from "./routers/restaurantPartner.router.js";
import RestaurantRoutes from "./routers/restaurant.router.js";
import userRoutes from "./routers/user.router.js";
import deliveryPartnerRoutes from "./routers/deliveryPartner.router.js";
import { connectRedis } from "./config/redis.js";

connectDB();
await connectRedis();
// for redis connection close on app termination
process.on("SIGINT", async () => {
  await redisClient.quit();
  process.exit(0);
});

const app = express();

// Middlewares
app.use(cors());

app.use(express.json());

app.use(helmet());

app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  res.send("API Running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/restaurant", RestaurantRoutes);
app.use("/api/restaurant-partner", RestaurantPartnerRoutes);
app.use("/api/user", userRoutes);
app.use("/api/delivery-partner", deliveryPartnerRoutes);
// Port
const PORT = process.env.PORT || 5000;

// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

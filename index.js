import express from "express";

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./auth/auth.router.js";

import Roles from "./enums/Roles.enum.js";

import RestaurantPartnerRoutes from "./routers/restaurantPartner.router.js";
import RestaurantRoutes from "./routers/restaurant.router.js";
import userRoutes from "./routers/user.router.js";
import orderRoutes from "./routers/order.routes.js";
import menuRoutes from "./routers/menu.routes.js";
import cartRoutes from "./routers/cart.routes.js";
import reviewRoutes from "./routers/review.routes.js";
import deliveryPartnerRoutes from "./routers/deliveryPartner.router.js";
import CouponRouters from "./routers/coupon.routes.js";
import NotificationRouters from "./routers/notification.routes.js";
import FooterRouters from "./routers/footer.routes.js";
import FAQRouters from "./routers/faq.routes.js";
import ContactRouters from "./routers/contact.routes.js";
import CheckoutRouters from "./routers/checkout.routes.js";
import PaymentRouters from "./routers/payment.routes.js";
import restaurantOrderRouters from "./routers/restuarntOrder.routes.js";
import AdminRouters from "./routers/admin.routes.js";

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
app.use("/api/restaurant-orders", restaurantOrderRouters);
app.use("/api/restaurant-partner", RestaurantPartnerRoutes);
app.use("/api/user", userRoutes);
app.use("/api/delivery-partner", deliveryPartnerRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/notification", NotificationRouters);
app.use("/api/coupon", CouponRouters);
app.use("/api/footer", FooterRouters);
app.use("/api/faq", FAQRouters);
app.use("/api/contact", ContactRouters);
app.use("/api/checkout", CheckoutRouters);
app.use("/api/payments", PaymentRouters);
app.use("/admin", AdminRouters);


export default app;

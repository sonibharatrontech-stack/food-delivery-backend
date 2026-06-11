import mongoose from "mongoose";
import dotenv from "dotenv";

// import seedRestaurants from "./restaurant.seeds.js";
import seedFAQs from "./FAQ.seeds.js";
import seedFooter from "./footer.seeds.js";
import seedContacts from "./contact.seeds.js";
// import seedCoupons from "./coupon.seeds.js";

dotenv.config();

const seedAll = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    // await seedRestaurants();
    // await seedFAQs();
    // await seedFooter();
    // await seedContacts()
    // await seedCoupons();

    console.log("All seeds completed");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAll();

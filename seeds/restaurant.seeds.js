import mongoose from "mongoose";
import dotenv from "dotenv";

import Restaurant from "../models/restaurant.model.js";
import RestaurantPartner from "../models/restaurantPartner.model.js";

dotenv.config();

const seedRestaurants = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const partner = await RestaurantPartner.findOne();

    if (!partner) {
      console.log("No restaurant partner found");
      process.exit();
    }

    // await Restaurant.deleteMany({});

    const cuisinesList = [
      ["North Indian", "Biryani"],
      ["Chinese", "Fast Food"],
      ["South Indian"],
      ["Pizza", "Italian"],
      ["Burger", "American"],
      ["Gujarati"],
      ["Punjabi"],
      ["Mughlai"],
      ["Desserts", "Bakery"],
      ["Healthy Food"],
    ];

    const restaurants = [
      {
        restaurantName: "Pizza Hut",
        slug: "pizza-hut",
        cuisines: ["Pizza", "Italian"],
        coverImage:
          "https://images.unsplash.com/photo-1513104890138-7c749659a591",
        rating: 4.5,
        isFeatured: true,
        isOpen: true,
      },
      {
        restaurantName: "Domino's Pizza",
        slug: "dominos-pizza",
        cuisines: ["Pizza", "Fast Food"],
        coverImage:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4",
        rating: 4.2,
        isFeatured: false,
        isOpen: true,
      },
      {
        restaurantName: "Burger King",
        slug: "burger-king",
        cuisines: ["Burger", "American"],
        coverImage:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
        rating: 4.3,
        isOpen: true,
      },
      {
        restaurantName: "McDonald's",
        slug: "mcdonalds",
        cuisines: ["Burger", "Fast Food"],
        coverImage: "https://images.unsplash.com/photo-1550547660-d9450f859349",
        rating: 4.1,
        isOpen: true,
      },
      {
        restaurantName: "KFC",
        slug: "kfc",
        cuisines: ["Chicken", "Fast Food"],
        coverImage:
          "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec",
        rating: 4.4,
        isFeatured: true,
      },
      {
        restaurantName: "Biryani Blues",
        slug: "biryani-blues",
        cuisines: ["Biryani", "North Indian"],
        coverImage:
          "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a",
        rating: 4.7,
      },
      {
        restaurantName: "Paradise Biryani",
        slug: "paradise-biryani",
        cuisines: ["Biryani", "Hyderabadi"],
        coverImage:
          "https://images.unsplash.com/photo-1589302168068-964664d93dc0",
        rating: 4.8,
      },
      {
        restaurantName: "Haldiram's",
        slug: "haldirams",
        cuisines: ["North Indian", "Snacks"],
        coverImage:
          "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f",
        rating: 4.5,
        isVeg: true,
      },
      {
        restaurantName: "Sagar Ratna",
        slug: "sagar-ratna",
        cuisines: ["South Indian"],
        coverImage:
          "https://images.unsplash.com/photo-1589301760014-d929f3979dbc",
        rating: 4.3,
        isVeg: true,
      },
      {
        restaurantName: "Saravana Bhavan",
        slug: "saravana-bhavan",
        cuisines: ["South Indian"],
        coverImage:
          "https://images.unsplash.com/photo-1606491956689-2ea866880c84",
        rating: 4.7,
        isVeg: true,
      },
      {
        restaurantName: "Barbeque Nation",
        slug: "barbeque-nation",
        cuisines: ["BBQ", "North Indian"],
        coverImage:
          "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd",
        rating: 4.6,
      },
      {
        restaurantName: "Mainland China",
        slug: "mainland-china",
        cuisines: ["Chinese"],
        coverImage:
          "https://images.unsplash.com/photo-1525755662778-989d0524087e",
        rating: 4.4,
      },
      {
        restaurantName: "Wow Momo",
        slug: "wow-momo",
        cuisines: ["Chinese", "Momos"],
        coverImage: "https://images.unsplash.com/photo-1544025162-d76694265947",
        rating: 4.2,
      },
      {
        restaurantName: "Subway",
        slug: "subway",
        cuisines: ["Healthy Food", "Fast Food"],
        coverImage:
          "https://images.unsplash.com/photo-1509722747041-616f39b57569",
        rating: 4.0,
      },
      {
        restaurantName: "Faasos",
        slug: "faasos",
        cuisines: ["Rolls", "Fast Food"],
        coverImage:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
        rating: 4.3,
      },
      {
        restaurantName: "Behrouz Biryani",
        slug: "behrouz-biryani",
        cuisines: ["Biryani", "Mughlai"],
        coverImage:
          "https://images.unsplash.com/photo-1563379091339-03246963d29c",
        rating: 4.8,
        isFeatured: true,
      },
      {
        restaurantName: "The Belgian Waffle Co.",
        slug: "belgian-waffle",
        cuisines: ["Desserts"],
        coverImage: "https://images.unsplash.com/photo-1562440499-64c9a111f713",
        rating: 4.5,
      },
      {
        restaurantName: "Baskin Robbins",
        slug: "baskin-robbins",
        cuisines: ["Ice Cream", "Desserts"],
        coverImage: "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
        rating: 4.4,
      },
      {
        restaurantName: "Starbucks",
        slug: "starbucks",
        cuisines: ["Coffee", "Cafe"],
        coverImage:
          "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
        rating: 4.3,
      },
      {
        restaurantName: "Cafe Coffee Day",
        slug: "cafe-coffee-day",
        cuisines: ["Cafe", "Coffee"],
        coverImage:
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
        rating: 4.0,
      },
    ];

    const finalRestaurants = restaurants.map((restaurant, index) => ({
      partner: partner._id,

      description: `${restaurant.restaurantName} serving quality food.`,

      tags: ["Popular", "Recommended"],

      phone: `987654${String(index).padStart(4, "0")}`,

      email: `${restaurant.slug}@gmail.com`,

      logo: restaurant.coverImage,

      coverImage: restaurant.coverImage,

      images: [
        restaurant.coverImage,
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      ],

      address: {
        addressLine: `${index + 1} Main Road`,
        landmark: "Near Metro Station",
        city:
          index % 4 === 0
            ? "Mumbai"
            : index % 4 === 1
              ? "Pune"
              : index % 4 === 2
                ? "Delhi"
                : "Bangalore",
        state:
          index % 4 === 0 || index % 4 === 1
            ? "Maharashtra"
            : index % 4 === 2
              ? "Delhi"
              : "Karnataka",
        pincode: "400001",
        country: "India",
      },

      isVeg: restaurant.isVeg || false,

      restaurantType: restaurant.isVeg ? "PURE_VEG" : "NON_VEG",

      paymentMethods:
        index % 2 === 0
          ? ["UPI", "CARD", "COD"]
          : ["UPI", "NETBANKING", "WALLET"],

      location: {
        type: "Point",
        coordinates: [72.8 + Math.random() * 0.2, 19.0 + Math.random() * 0.2],
      },

      deliveryTime: 20 + index,

      deliveryRadius: 3 + (index % 7),

      deliveryFee: index % 5 === 0 ? 0 : 20,

      minimumOrderAmount: 99,

      averageCostForTwo: 300 + index * 50,

      isOpen: index % 3 !== 0,

      isBusy: index % 6 === 0,

      isFeatured: restaurant.isFeatured || false,

      isFavourite: index % 5 === 0,

      rating: restaurant.rating,

      totalReviews: 100 + index * 25,

      totalOrders: 500 + index * 100,

      status:
        index % 10 === 0 ? "BLOCKED" : index % 7 === 0 ? "INACTIVE" : "ACTIVE",

      openingHours: [
        {
          day: "Monday",
          openTime: "09:00",
          closeTime: "22:00",
        },
        {
          day: "Tuesday",
          openTime: "09:00",
          closeTime: "22:00",
        },
        {
          day: "Wednesday",
          openTime: "09:00",
          closeTime: "22:00",
        },
        {
          day: "Thursday",
          openTime: "09:00",
          closeTime: "22:00",
        },
        {
          day: "Friday",
          openTime: "09:00",
          closeTime: "23:00",
        },
        {
          day: "Saturday",
          openTime: "09:00",
          closeTime: "23:00",
        },
        {
          day: "Sunday",
          openTime: "10:00",
          closeTime: "21:00",
        },
      ],

      ...restaurant,
    }));

    const inserted = await Restaurant.insertMany(finalRestaurants);

    console.log("Inserted Count:", inserted.length);

    const total = await Restaurant.countDocuments();

    console.log("Total Restaurants:", total);

    console.log("Restaurants seeded successfully");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedRestaurants();

import Contact from "../models/contact.model.js";

const contacts = [
  {
    name: "Rahul Sharma",
    email: "rahul.sharma@gmail.com",
    phone: "9876543210",
    subject: "Order Not Delivered",
    message:
      "My order was marked as delivered but I have not received it. Please help resolve this issue.",
    status: "PENDING",
  },

  {
    name: "Priya Patel",
    email: "priya.patel@gmail.com",
    phone: "9876543211",
    subject: "Refund Request",
    message:
      "The restaurant cancelled my order but the payment has not been refunded yet.",
    status: "IN_PROGRESS",
  },

  {
    name: "Amit Verma",
    email: "amit.verma@gmail.com",
    phone: "9876543212",
    subject: "Wrong Food Item Received",
    message:
      "I ordered a Veg Burger but received a Chicken Burger instead.",
    status: "PENDING",
  },

  {
    name: "Sneha Gupta",
    email: "sneha.gupta@gmail.com",
    phone: "9876543213",
    subject: "Delivery Partner Complaint",
    message:
      "The delivery executive behaved unprofessionally during delivery.",
    status: "RESOLVED",
  },

  {
    name: "Rohan Mehta",
    email: "rohan.mehta@gmail.com",
    phone: "9876543214",
    subject: "Late Delivery",
    message:
      "My order arrived more than 1 hour after the estimated delivery time.",
    status: "IN_PROGRESS",
  },

  {
    name: "Anjali Singh",
    email: "anjali.singh@gmail.com",
    phone: "9876543215",
    subject: "Coupon Not Working",
    message:
      "The coupon code FOOD50 is showing as invalid during checkout.",
    status: "PENDING",
  },

  {
    name: "Karan Malhotra",
    email: "karan.malhotra@gmail.com",
    phone: "9876543216",
    subject: "Account Issue",
    message:
      "I am unable to login to my account even after OTP verification.",
    status: "PENDING",
  },

  {
    name: "Neha Joshi",
    email: "neha.joshi@gmail.com",
    phone: "9876543217",
    subject: "Food Quality Complaint",
    message:
      "The food received was cold and not fresh. Kindly investigate.",
    status: "RESOLVED",
  },

  {
    name: "Vikas Yadav",
    email: "vikas.yadav@gmail.com",
    phone: "9876543218",
    subject: "Restaurant Partnership",
    message:
      "I own a restaurant and would like to partner with Foodie Express.",
    status: "IN_PROGRESS",
  },

  {
    name: "Pooja Desai",
    email: "pooja.desai@gmail.com",
    phone: "9876543219",
    subject: "Address Update Issue",
    message:
      "I am unable to save my new delivery address in the application.",
    status: "PENDING",
  },

  {
    name: "Arjun Kapoor",
    email: "arjun.kapoor@gmail.com",
    phone: "9876543220",
    subject: "Missing Item",
    message:
      "One beverage item was missing from my order when it arrived.",
    status: "RESOLVED",
  },

  {
    name: "Meera Nair",
    email: "meera.nair@gmail.com",
    phone: "9876543221",
    subject: "Delivery Partner Registration",
    message:
      "I want to become a delivery partner. Please guide me through the process.",
    status: "IN_PROGRESS",
  },
];

const seedContacts = async () => {
  try {
    await Contact.deleteMany({});

    const inserted = await Contact.insertMany(contacts);

    console.log(
      `Contacts Seeded Successfully: ${inserted.length}`
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default seedContacts;
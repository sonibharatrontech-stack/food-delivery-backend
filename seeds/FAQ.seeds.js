import mongoose from "mongoose";
import dotenv from "dotenv";

import FAQ from "../models/faq.model.js";

dotenv.config();

const faqData = [
  {
    question: "How do I place an order?",
    answer:
      "Browse restaurants, add items to your cart, choose a delivery address, select a payment method, and place your order.",
  },

  {
    question: "How can I track my order?",
    answer:
      "You can track your order in real-time from the Order Tracking page after the order is confirmed.",
  },

  {
    question: "Can I cancel my order?",
    answer:
      "Orders can be cancelled before the restaurant starts preparing them. Once preparation begins, cancellation may not be available.",
  },

  {
    question: "What payment methods are supported?",
    answer:
      "We support UPI, Credit Cards, Debit Cards, Net Banking, Wallets, and Cash on Delivery where available.",
  },

  {
    question: "My payment failed but money was deducted. What should I do?",
    answer:
      "In most cases, the deducted amount is automatically refunded within 3-7 business days. Contact support if the refund is delayed.",
  },

  {
    question: "How do I apply a coupon code?",
    answer:
      "Enter the coupon code on the checkout page and click Apply before placing your order.",
  },

  {
    question: "Why is my coupon not working?",
    answer:
      "Coupons may have minimum order requirements, expiry dates, usage limits, or restaurant restrictions.",
  },

  {
    question: "What should I do if my order is delayed?",
    answer:
      "Track your order from the tracking screen. If the delay is excessive, contact support through the Help Center.",
  },

  {
    question: "What if I receive the wrong order?",
    answer:
      "Open the order details page and report the issue. Our support team will investigate and assist you.",
  },

  {
    question: "How do refunds work?",
    answer:
      "Approved refunds are credited back to the original payment source within 3-7 business days depending on your bank.",
  },

  {
    question: "Can I schedule an order for later?",
    answer:
      "Yes. Restaurants that support scheduled delivery allow you to choose a future delivery time during checkout.",
  },

  {
    question: "How can I save multiple addresses?",
    answer:
      "Go to Profile → Saved Addresses and add multiple delivery locations for faster checkout.",
  },

  {
    question: "How do I contact customer support?",
    answer:
      "Visit the Help & Support section from your profile and create a support ticket or chat with support.",
  },

  {
    question: "Is my personal information secure?",
    answer:
      "Yes. We use industry-standard security measures to protect your personal and payment information.",
  },

  {
    question: "How are restaurant ratings calculated?",
    answer:
      "Ratings are based on verified customer reviews and are updated continuously as new reviews are submitted.",
  },

  {
    question: "Can I edit my review after submitting it?",
    answer:
      "Yes. You can edit your review from your profile after it has been submitted.",
  },

  {
    question: "What are BiteCoins?",
    answer:
      "BiteCoins are loyalty rewards earned on eligible orders and can be redeemed for discounts and exclusive offers.",
  },

  {
    question: "How do I become a delivery partner?",
    answer:
      "Apply through the Delivery Partner registration page and complete the onboarding and verification process.",
  },

  {
    question: "How do I register my restaurant?",
    answer:
      "Visit the Restaurant Partner section, submit your business information, and complete the approval process.",
  },

  {
    question: "What if a restaurant is closed?",
    answer:
      "Closed restaurants cannot accept new orders. You can browse nearby alternatives that are currently open.",
  },
];

const seedFAQs = async () => {
  try {
    // Optional
    await FAQ.deleteMany({});

    const insertedFAQs = await FAQ.insertMany(faqData);

    console.log(`FAQs Inserted Successfully: ${insertedFAQs.length}`);
  } catch (error) {
    throw error;
  }
};

// seedFAQs();

export default seedFAQs;

import Footer from "../models/footer.model.js";

const footerData = {
  companyLinks: [
    {
      title: "About Us",
      url: "/about",
    },
    {
      title: "Careers",
      url: "/careers",
    },
    {
      title: "Partner With Us",
      url: "/partner",
    },
    {
      title: "Become a Delivery Partner",
      url: "/delivery-partner",
    },
    {
      title: "Blog",
      url: "/blog",
    },
  ],

  contactLinks: [
    {
      title: "Help Center",
      url: "/help",
    },
    {
      title: "Support",
      url: "/support",
    },
    {
      title: "Contact Us",
      url: "/contact",
    },
    {
      title: "Report an Issue",
      url: "/report-issue",
    },
    {
      title: "FAQs",
      url: "/faq",
    },
  ],

  legalLinks: [
    {
      title: "Terms & Conditions",
      url: "/terms",
    },
    {
      title: "Privacy Policy",
      url: "/privacy",
    },
    {
      title: "Refund Policy",
      url: "/refund-policy",
    },
    {
      title: "Cookie Policy",
      url: "/cookie-policy",
    },
    {
      title: "Security",
      url: "/security",
    },
  ],

  cityLinks: [
    {
      title: "Mumbai",
      url: "/city/mumbai",
    },
    {
      title: "Delhi",
      url: "/city/delhi",
    },
    {
      title: "Bangalore",
      url: "/city/bangalore",
    },
    {
      title: "Pune",
      url: "/city/pune",
    },
    {
      title: "Hyderabad",
      url: "/city/hyderabad",
    },
    {
      title: "Chennai",
      url: "/city/chennai",
    },
    {
      title: "Kolkata",
      url: "/city/kolkata",
    },
    {
      title: "Ahmedabad",
      url: "/city/ahmedabad",
    },
  ],

  socialLinks: [
    {
      platform: "Facebook",
      url: "https://facebook.com/foodieexpress",
    },
    {
      platform: "Instagram",
      url: "https://instagram.com/foodieexpress",
    },
    {
      platform: "Twitter",
      url: "https://twitter.com/foodieexpress",
    },
    {
      platform: "LinkedIn",
      url: "https://linkedin.com/company/foodieexpress",
    },
    {
      platform: "YouTube",
      url: "https://youtube.com/@foodieexpress",
    },
  ],

  appLinks: {
    playStore:
      "https://play.google.com/store/apps/details?id=com.foodieexpress",

    appStore:
      "https://apps.apple.com/app/foodie-express/id123456789",
  },
};

const seedFooter = async () => {
  try {
    await Footer.deleteMany({});

    const footer = await Footer.create(footerData);

    console.log("Footer Seeded Successfully");
    console.log("Footer ID:", footer._id);
  } catch (error) {
    console.error(error);
  }
};

export default seedFooter;
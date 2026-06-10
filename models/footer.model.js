import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const footerSchema = new mongoose.Schema(
  {
    companyLinks: [linkSchema],

    contactLinks: [linkSchema],

    legalLinks: [linkSchema],

    cityLinks: [linkSchema],

   socialLinks: [
  {
    platform: String,
    url: String,
    _id: false,
  },
],

    appLinks: {
      playStore: {
        type: String,
        default: "",
      },

      appStore: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Footer = mongoose.model(
  "Footer",
  footerSchema
);

export default Footer;
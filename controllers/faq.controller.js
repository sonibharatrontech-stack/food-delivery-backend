import FAQ from "../models/faq.model.js";

/*
|--------------------------------------------------
| CREATE FAQ
|--------------------------------------------------
*/

export const createFAQ =
  async (req, res) => {
    try {

      const faq =
        await FAQ.create(
          req.body
        );

      return res.status(201).json({
        success: true,
        message:
          "FAQ created successfully",
        data: faq,
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  };

/*
|--------------------------------------------------
| GET FAQS
|--------------------------------------------------
*/

export const getFAQs =
  async (req, res) => {
    try {

      const faqs =
        await FAQ.find({
          isActive: true,
        });

      return res.status(200).json({
        success: true,
        results: faqs.length,
        data: faqs,
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  };
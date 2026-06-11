import Contact from "../models/contact.model.js";

/*
|--------------------------------------------------
| CREATE CONTACT MESSAGE
|--------------------------------------------------
*/

export const createContactMessage = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Message submitted successfully",
      data: contact,
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
| GET ALL CONTACT MESSAGES
|--------------------------------------------------
*/

export const getAllContactMessages = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      results: contacts.length,
      data: contacts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

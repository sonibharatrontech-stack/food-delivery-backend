export const approveDeliveryPartner = async (req, res) => {
  try {
    const { partnerId } = req.params;

    const partner = await DeliveryPartner.findById(partnerId);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    partner.status = "APPROVED";

    partner.isApproved = true;

    await partner.save();

    return res.status(200).json({
      success: true,
      message: "Delivery partner approved",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
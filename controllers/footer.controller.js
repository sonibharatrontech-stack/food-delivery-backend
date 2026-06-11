import Footer from "../models/footer.model.js";

/*
|------------------------------------------------------------------
| GET FOOTER
|------------------------------------------------------------------
*/

export const getFooter = async (
  req,
  res
) => {
  try {

    const footer =
      await Footer.findOne();

    return res.status(200).json({
      success: true,
      data: footer,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/*
|------------------------------------------------------------------
| UPDATE FOOTER
|------------------------------------------------------------------
*/

export const updateFooter = async (
  req,
  res
) => {
  try {

    const footer =
      await Footer.findOneAndUpdate(
        {},
        req.body,
        {
          new: true,
          upsert: true,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Footer updated successfully",
      data: footer,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
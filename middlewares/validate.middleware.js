// middlewares/validate.middleware.js

import ApiError from "../utils/APIError.js";

const validate = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.parseAsync(req.body);

    next();
  } catch (error) {
    const errors = error.errors?.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    next(new ApiError(400, errors?.[0]?.message || "Validation failed"));
  }
};

export default validate;

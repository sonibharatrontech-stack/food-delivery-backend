import jwt from "jsonwebtoken";

/*
|--------------------------------------------------------------------------
| GENERATE ACCESS TOKEN
|--------------------------------------------------------------------------
*/

export const generateAccessToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },

    process.env.JWT_ACCESS_SECRET,

    {
      expiresIn: "1h",
    },
  );
};

/*
|--------------------------------------------------------------------------
| GENERATE REFRESH TOKEN
|--------------------------------------------------------------------------
*/

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },

    process.env.JWT_REFRESH_SECRET,

    {
      expiresIn: "7d",
    },
  );
};
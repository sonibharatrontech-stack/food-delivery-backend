import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

import generateOTP from "../utils/generateOTP.js";
import sendEmail from "../utils/SendEmail.js";
import sendSMS from "../utils/sendSMS.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/token.service.js";
import Roles from "../enums/Roles.enum.js";
import redisClient from "../config/redis.js";

// ================= CHECK USER EXISTENCE =================
export const checkUser = async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({
      phone,
    });

    return res.status(200).json({
      success: true,
      exists: !!user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, phone, roles } = req.body;

    const existingUser = await User.findOne({
      phone,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      roles: roles || [Roles.CUSTOMER],
      // otp,
      // otpExpiry: Date.now() + 5 * 60 * 1000,
    });

    const otp = generateOTP();

    // STORE OTP IN REDIS
    await redisClient.set(`otp:${phone}`, otp, {
      EX: 300,
    });

    await sendSMS(phone, otp);

    return res.status(201).json({
      success: true,
      message: "OTP sent successfully",
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= SEND OTP =================
export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number required",
      });
    }

    // CHECK USER
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ================= RATE LIMIT =================

    // MAX 5 OTP / HOUR
    const attemptsKey = `otp_attempts:${phone}`;

    const attempts = await redisClient.get(attemptsKey);

    if (attempts && Number(attempts) >= 5) {
      return res.status(429).json({
        success: false,
        message: "Maximum OTP limit reached. Try again after 1 hour.",
      });
    }

    // ================= RESEND COOLDOWN =================

    const cooldownKey = `otp_cooldown:${phone}`;

    const cooldownExists = await redisClient.exists(cooldownKey);

    if (cooldownExists) {
      const ttl = await redisClient.ttl(cooldownKey);

      return res.status(429).json({
        success: false,
        message: `Please wait ${ttl} seconds before requesting OTP again`,
      });
    }

    // ================= GENERATE OTP =================

    const otp = generateOTP();

    // STORE OTP FOR 5 MINUTES
    await redisClient.set(`otp:${phone}`, otp, {
      EX: 300,
    });

    // COOLDOWN 30 SEC
    await redisClient.set(cooldownKey, "1", {
      EX: 30,
    });

    // OTP ATTEMPTS COUNT
    if (!attempts) {
      await redisClient.set(attemptsKey, 1, {
        EX: 3600,
      });
    } else {
      await redisClient.incr(attemptsKey);
    }

    // SEND SMS
    await sendSMS(phone, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============Varify OTP================
export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "UserId and OTP required",
      });
    }

    // FIND USER
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // VERIFY ATTEMPTS LIMIT
    const verifyAttemptsKey = `otp_verify_attempts:${user.phone}`;

    const verifyAttempts = await redisClient.get(verifyAttemptsKey);

    if (verifyAttempts && Number(verifyAttempts) >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many invalid attempts. Try again later.",
      });
    }

    // GET OTP FROM REDIS
    const storedOtp = await redisClient.get(`otp:${user.phone}`);

    // OTP EXPIRED
    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // INVALID OTP
    if (storedOtp !== otp) {
      // STORE FAILED ATTEMPTS
      if (!verifyAttempts) {
        await redisClient.set(verifyAttemptsKey, 1, {
          EX: 300,
        });
      } else {
        await redisClient.incr(verifyAttemptsKey);
      }

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // DELETE OTP AFTER SUCCESS
    await redisClient.del(`otp:${user.phone}`);

    // CLEAR VERIFY ATTEMPTS
    await redisClient.del(verifyAttemptsKey);

    // VERIFY USER
    user.isVerified = true;

    await user.save();

    // TOKENS
    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);

    // SAVE REFRESH TOKEN
    await redisClient.set(`refresh:${user._id}`, refreshToken, {
      EX: 7 * 24 * 60 * 60,
    });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    // VERIFY REFRESH TOKEN
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // CHECK REDIS TOKEN
    const storedToken = await redisClient.get(`refresh:${decoded.id}`);

    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // FIND USER
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // GENERATE NEW ACCESS TOKEN
    const accessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Refresh token expired",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // DELETE REFRESH TOKEN
    await redisClient.del(`refresh:${userId}`);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

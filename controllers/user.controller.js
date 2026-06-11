import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// CREATE USER
export const createUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.create(req.body);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});



// GET SINGLE USER
export const getUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-otp -refreshToken",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE USER
export const updateUser = asyncHandler(async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});



// ===================Addresss===================

export const addAddress = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const { street, city, state, pincode, landmark, label, location } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.addresses.push({
    street,
    city,
    state,
    pincode,
    landmark,
    label,
    location,
  });

  await user.save();

  res.status(201).json({
    success: true,
    message: "Address added successfully",
    data: user.addresses,
  });
});

export const getAddresses = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("addresses");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    count: user.addresses.length,
    data: user.addresses,
  });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const { userId, addressId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.addresses = user.addresses.filter(
    (addr) => addr._id.toString() !== addressId,
  );

  await user.save();

  res.status(200).json({
    success: true,
    message: "Address deleted successfully",
  });
});

export const updateAddress = async (req, res) => {
  const { userId, addressId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const address = user.addresses.id(addressId);

  if (!address) {
    return res.status(404).json({
      success: false,
      message: "Address not found",
    });
  }

  address.street = req.body.street;
  address.city = req.body.city;
  address.state = req.body.state;
  address.pincode = req.body.pincode;
  address.landmark = req.body.landmark;
  address.label = req.body.label;

  await user.save();

  res.status(200).json({
    success: true,
    data: address,
  });
};
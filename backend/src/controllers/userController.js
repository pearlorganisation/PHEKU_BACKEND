import User from "../models/user.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendMail } from "../utils/nodemailerConfig.js";
import jwt from "jsonwebtoken";
import ejs from "ejs";
import { filePath } from "../utils/ejsFilepathHelper.js";

export const getUserDetails = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    return next(new ApiError("User is not found", 404));
  }
  return res
    .status(200)
    .json(new ApiResponse("User found successfully", user, 200));
});

export const updateUserDetails = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  // Fetch the existing user details
  let user = await User.findById(userId);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  const profilePic = req?.file;
  let response = [];
  if (profilePic) {
    response = await uploadFileToCloudinary(profilePic);
  }
  const existingUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      ...req.body,
      profilePic: response[0],
    },
    { new: true }
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse("User updated successfully", existingUser, 200));
});

export const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params?.id).select(
    "-password -refreshToken"
  );
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  return res
    .status(200)
    .json(new ApiResponse("User found successfully", user, 200));
});

export const deleteUserById = asyncHandler(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params?.id);
  if (!deletedUser) {
    return next(new ApiError("User is not deleted", 404));
  }
  return res
    .status(200)
    .json(new ApiResponse("User deleted successfully", null, 200));
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ApiError("User is not logged in", 400));
  } else {
    const isMatch = await user.isPasswordCorrect(currentPassword);
    if (!isMatch) {
      return next(new ApiError("Entered wrong current password", 400));
    }
    try {
      const validate = updateValidation.parse({ newPassword });
      console.log(validate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return next(new ApiError("Validation failed", 400)); // Send a validation error response
      } else {
        console.error("An unexpected error occurred:", error);
        return next(new ApiError("An unexpected error occurred", 500)); // Handle unexpected errors
      }
    }
    user.password = newPassword;
    await user.save();
    return res
      .status(200)
      .json(new ApiResponse("Password reset successfull", null, 200));
  }
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError("Email is not registered", 404));
  }
  const resetToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h",
  });
  // Construct reset URL
  const resetLink = `http://your-app-url/reset-password/${resetToken}`;

  // html content that will be sent via email
  const htmlContent = await ejs.renderFile(filePath, { resetLink });
  const data = await sendMail(email, htmlContent);
  if (!data) {
    return next(new ApiError("Unable to send the reset mail", 400));
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        "Successfully sent the mail please check your emal",
        data,
        200
      )
    );
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  // extract reset token //
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(resetToken, process.env.JWT_SECRET_KEY);
  } catch (error) {
    return next(new ApiError("Invalid or expired reset token!", 400));
  }

  // Find the user by their _id decoded from the token
  const user = await User.findById(decoded._id);
  console.log("User found", user);
  if (!user) {
    return next(new ApiError("User not found!", 404));
  }

  // Update the user's password
  user.password = newPassword;
  await user.save();

  res
    .status(200)
    .json(new ApiResponse("Password reset successfull", null, 200));
});

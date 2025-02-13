import User from "../models/user.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendMail } from "../utils/nodemailerConfig.js";
import jwt from "jsonwebtoken";
import ejs from "ejs";
import { filePath } from "../utils/ejsFilepathHelper.js";
import { uploadFileToCloudinary } from "../configs/cloudinary.js";
import {
  sendInvitationMail,
  sendPasswordSetupInvitation,
} from "../utils/Mail/emailTemplate.js";
import AdministrativeUser from "../models/AdministrativeUser.js";
import { AVAILABLE_USER_ROLES } from "../../constants.js";

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
  console.log(req.file);
  let response = [];
  if (profilePic) {
    response = await uploadFileToCloudinary(profilePic, "Profiles");
  }
  console.log(response);
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
  const resetLink = `${process.env.FRONTEND_RESET_PASSWORD_PAGE}/${resetToken}`;

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

export const createUserByAdmin = asyncHandler(async (req, res, next) => {
  const { fullName, email, role, isInvited } = req.body;

  if (!AVAILABLE_USER_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role: ${role}. Must be one of ${AVAILABLE_USER_ROLES.join(
        ", "
      )}`,
    });
  }

  const user = await AdministrativeUser.create({
    fullName,
    email,
    role, // Use the role from body
    isInvited,
    status: "PENDING",
  });

  const inviteToken = jwt.sign({ email, role }, process.env.JWT_SECRET_KEY, {
    expiresIn: "2d",
  });

  const inviteLink = `${process.env.CLIENT_URL}/invite/${inviteToken}`;
  await sendInvitationMail(email, { inviteLink })
    .then(() => {
      return res.status(200).json({
        success: true,
        message: "Mail sent successfully.",
      });
    })
    .catch((error) => {
      res.status(400).json({
        success: false,
        message: `Unable to send mail! ${error.message}`,
      });
    });
});

export const verifyInvite = asyncHandler(async (req, res, next) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({
      email: decoded.email,
      role: decoded.role,
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ email: user.email, fullName: user.fullName, role: user.role });
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
});

export const setPassword = asyncHandler(async (req, res, next) => {
  const { fullName, password } = req.body;
  const { token } = req.query;
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  user.password = password;
  user.fullName = fullName;
  user.status = "ACTIVE";
  await user.save();

  const loginUrl = `${process.env.CLIENT_URL}/`;
  await sendPasswordSetupInvitation(user.email, { fullName, loginUrl }).then(
    () => {
      return res.status(200).json({
        success: true,
        message: "Mail sent successfully.",
      });
    },
    (error) => {
      res.status(400).json({
        success: false,
        message: `Unable to send mail! ${error.message}`,
      });
    }
  );
});

export const resendInvite = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await AdministrativeUser.findById(userId);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const inviteToken = jwt.sign(
    { email: user.email, role: user.role },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "2d",
    }
  );
  const inviteLink = `${process.env.CLIENT_URL}/invite/${inviteToken}`;
  await sendInvitationMail(user.email, { inviteLink })
    .then(() => {
      return res.status(200).json({
        success: true,
        message: "Mail sent successfully.",
      });
    })
    .catch((error) => {
      res.status(400).json({
        success: false,
        message: `Unable to send mail! ${error.message}`,
      });
    });
});

export const changeRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  user.role = role;
  await user.save();
  return res.status(200).json({ message: "Role changed successfully" });
});

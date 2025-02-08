import { AVAILABLE_USER_ROLES, COOKIE_OPTIONS } from "../../constants.js";
import User from "../models/user.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signUpValidation, updateValidation } from "../utils/Validation.js";
import AdministrativeUser from "../models/AdministrativeUser.js";
import { sendInvitationMail } from "../utils/Mail/emailTemplate.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, mobileNumber, role } = req.body;

  // Validation
  try {
    const validatedData = signUpValidation.parse({
      fullName,
      email,
      password,
      mobileNumber,
    });
    console.log("Validated data:", validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors);
      return next(new ApiError("Validation failed", 400)); // Send a validation error response
    } else {
      console.error("An unexpected error occurred:", error);
      return next(new ApiError("An unexpected error occurred", 500)); // Handle unexpected errors
    }
  }

  // Check if the user already exists
  const existingUser = await User.findOne({
    email,
  });
  if (existingUser) {
    return next(new ApiError("User already exists", 400));
  }

  // Create new user after successful validation
  const newUser = await User.create({
    fullName,
    email,
    password,
    role,
    mobileNumber,
  });

  // Generate access and refresh tokens
  const access_token = newUser.generateAccessToken();
  const refresh_token = newUser.generateRefreshToken();
  newUser.refreshToken = refresh_token; // Save new refresh token

  await newUser.save({
    validateBeforeSave: false,
  });

  // Set cookies and send response
  res
    .cookie("access_token", access_token, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
    })
    .cookie("refresh_token", refresh_token, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    })
    .status(201)
    .json({
      success: true,
      message: "Signup successful, and logged in successfully",
    });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req?.body;
  if (!email || !password) {
    return next(new ApiError("All fields are required", 400));
  }
  const existingUser = await User.findOne({ email });
  if (!existingUser) return next(new ApiError("No user found", 400));

  const isValidPassword = await existingUser.isPasswordCorrect(password);

  if (!isValidPassword) {
    return next(new ApiError("Wrong password", 400));
  }

  const access_token = existingUser.generateAccessToken();
  const refresh_token = existingUser.generateRefreshToken();

  existingUser.refreshToken = refresh_token;
  await existingUser.save({ validateBeforeSave: false });

  res
    .cookie("access_token", access_token, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), //1day set 15min later on
    })
    .cookie("refresh_token", refresh_token, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15day
    })
    .status(200)
    .json(new ApiResponse("Logged in successfully"));
});

export const logout = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
  res
    .cookie("access_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
    .cookie("refresh_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
    .status(200)
    .json(new ApiResponse("Logout successfully"));
});

export const createUserByAdmin = asyncHandler(async (req, res, next) => {
  const { email, role, isInvited } = req.body;

  if (!AVAILABLE_USER_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role: ${role}. Must be one of ${AVAILABLE_USER_ROLES.join(
        ", "
      )}`,
    });
  }
  const user = await AdministrativeUser.create({
    email,
    role, // Use the role from body
    isInvited,
    status: "PENDING",
  });

  const inviteToken = jwt.sign({ email, role }, process.env.JWT_SECRET_KEY, {
    expiresIn: "2d",
  });

  const inviteLink = `${process.env.CLIENT_URL}/invite/${inviteToken}`;
  const data = await sendInvitationMail(email, { inviteLink });
  if (!data) {
    return next(new ApiError("Unable to send the invitation mail", 400));
  }
  res.status(201).json({ user, inviteToken });
});

export const verifyInvite = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({
      email: decoded.email,
      role: decoded.role,
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    res.status(200).json({ email: user.email });
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
});

export const setPassword = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  user.password = password;
  user.status = "ACTIVE";
  await user.save();
  res.status(200).json({ message: "Password set successfully" });
});

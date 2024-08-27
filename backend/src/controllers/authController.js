import { COOKIE_OPTIONS } from "../../constants.js";
import User from "../models/user.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password) {
    return next(new ApiError("All fields are required", 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError("User already exists", 400));
  }

  const newUser = await User.create({
    fullName,
    email,
    password,
    role,
  });

  // Generate access and refresh tokens
  const access_token = newUser.generateAccessToken();
  const refresh_token = newUser.generateRefreshToken();
  newUser.refreshToken = refresh_token;

  await newUser.save({ validateBeforeSave: false });

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
    .json({ success: true, message: "Logged in successfully" });
});

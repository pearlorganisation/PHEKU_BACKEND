import User from "../models/user.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//Get user details Contoller
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

import { asyncHandler } from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import Specialization from "../../models/course/specialization .js";

// Create a new specialization
export const createSpecialization = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  // Create a specialization
  const specialization = await Specialization.create({ name });

  if (!specialization) {
    return next(new ApiError("Failed to create the specialization", 400));
  }

  return res
    .status(201)
    .json(
      new ApiResponse("Created the specialization successfully", specialization)
    );
});

// Get all specializations
export const getSpecializations = asyncHandler(async (req, res, next) => {
  const specializations = await Specialization.find();

  if (!specializations || !specializations.length) {
    return next(new ApiError("No specializations found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Fetched all specializations", specializations));
});

// Get a specialization by ID
export const getSpecializationById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const specialization = await Specialization.findById(id);

  if (!specialization) {
    return next(new ApiError("Specialization not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Fetched specialization", specialization));
});

// Update a specialization by ID
export const updateSpecializationById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  console.log("id is -----------", id)
  const specialization = await Specialization.findByIdAndUpdate(
    id,
    { name },
    { new: true, runValidators: true }
  );

  if (!specialization) {
    return next(new ApiError("Failed to update the specialization", 400));
  }

  return res
    .status(200)
    .json(
      new ApiResponse("Updated the specialization successfully", specialization)
    );
});

// Delete a specialization by ID
export const deleteSpecializationById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const specialization = await Specialization.findByIdAndDelete(id);

  if (!specialization) {
    return next(new ApiError("Failed to delete the specialization", 404));
  }

  return res
    .status(200)
    .json(
      new ApiResponse("Deleted the specialization successfully", specialization)
    );
});

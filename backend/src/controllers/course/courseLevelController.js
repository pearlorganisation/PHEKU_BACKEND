import CourseLevel from "../../models/course/courseLevel.js";
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new course level
export const createCourseLevel = asyncHandler(async (req, res, next) => {
  const { level } = req.body;
  const courseLevel = await CourseLevel.create({ level });
  if (!courseLevel) {
    return next(new ApiError("Failed to create the course level", 400));
  }
  return res
    .status(201)
    .json(new ApiResponse("Course level created successfully", courseLevel));
});

// Get all course levels
export const getCourseLevels = asyncHandler(async (req, res, next) => {
  const courseLevels = await CourseLevel.find();
  if (!courseLevels || !courseLevels.length) {
    return next(new ApiError("No course levels found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Fetched all course levels", courseLevels));
});

// Get a course level by ID
export const getCourseLevelById = asyncHandler(async (req, res, next) => {
  const courseLevel = await CourseLevel.findById(req.params.id);
  if (!courseLevel) {
    return next(new ApiError("Course level not found", 404));
  }
  return res
    .status(200)
    .json(new ApiResponse("Course level fetched successfully", courseLevel));
});

// Update a course level by ID
export const updateCourseLevelById = asyncHandler(async (req, res, next) => {
  const { level } = req.body;
  const courseLevel = await CourseLevel.findByIdAndUpdate(
    req.params.id,
    { level },
    { new: true, runValidators: true }
  );
  if (!courseLevel) {
    return next(new ApiError("Failed to update the course level", 400));
  }
  return res
    .status(200)
    .json(new ApiResponse("Course level updated successfully", courseLevel));
});

// Delete a course level by ID
export const deleteCourseLevelById = asyncHandler(async (req, res, next) => {
  const courseLevel = await CourseLevel.findByIdAndDelete(req.params.id);
  if (!courseLevel) {
    return next(new ApiError("Failed to delete the course level", 404));
  }
  return res
    .status(200)
    .json(new ApiResponse("Course level deleted successfully"));
});

import { asyncHandler } from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { paginate } from "../../utils/pagination.js";
import Course from "../../models/course/course.js";

// Create course
export const createCourse = asyncHandler(async (req, res, next) => {
  const course = new Course(req.body);
  await course.save(); // Explicitly calls the save method to call post middleware
  if (!course) {
    return next(new ApiError("Failed to create the course", 400));
  }
  return res
    .status(201)
    .json(new ApiResponse("Course created successfully", course));
});

// Get all Courses
export const getAllCourse = asyncHandler(async (req, res, next) => {
  // Extract query parameters with default values
  const {
    page = "1",
    limit = "10",
    countryId,
    universityId,
    courseLevelId,
    specializationId,
    duration,
    tutionFees,
  } = req.query;

  // Convert query parameters to integers where necessary
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  // Helper function to handle multiple selection
  const handleMultiSelect = (value) =>
    value ? { $in: value.split(",") } : undefined;

  // Construct filter object dynamically
  const filter = {
    ...(countryId && { country: handleMultiSelect(countryId) }),
    ...(universityId && { university: handleMultiSelect(universityId) }),
    ...(courseLevelId && { courseLevel: handleMultiSelect(courseLevelId) }),
    ...(specializationId && {
      specialization: handleMultiSelect(specializationId),
    }),
    ...(duration && {
      duration: {
        $gte: parseInt(duration.split(",")[0]),
        $lte: parseInt(duration.split(",")[1]),
      },
    }),
    ...(tutionFees && {
      "tutionFees.amount": {
        $gte: parseInt(tutionFees.split(",")[0]),
        $lte: parseInt(tutionFees.split(",")[1]),
      },
    }),
  };

  console.log("Filter:", filter); // Debugging filter object

  // Fetch paginated data
  const { data: courses, pagination } = await paginate(
    Course,
    pageNum,
    limitNum,
    [
      { path: "country" }, // Fetch only required fields if neccessary
      { path: "university" },
      { path: "specialization" },
      { path: "courseLevel" },
    ],
    filter
  );

  // Handle empty result
  if (!courses || courses.length === 0) {
    return next(new ApiError("No courses available", 404));
  }

  // Return response
  return res
    .status(200)
    .json(new ApiResponse("Courses fetched successfully", courses, pagination));
});

export const getCourseById = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params?.id);
  if (!course) {
    return next(new ApiError("Unable to get the course", 404));
  }
  return res.status(200).json(new ApiResponse("Fetched the course", course));
});

export const deleteCourseById = asyncHandler(async (req, res, next) => {
  const deletedCourse = await Course.findByIdAndDelete(req.params?.id); //findByIdAndDelete internally calls findOneAndDelete

  if (!deletedCourse) {
    return next(new ApiError("Failed to delete the course", 400));
  }
  return res
    .status(200)
    .json(new ApiResponse("Successfully deleted the course"));
});

export const updateCourseById = asyncHandler(async (req, res, next) => {
  const updatedCourse = await Course.findByIdAndUpdate(
    req.params?.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedCourse) {
    return next(new ApiError("Failed to update the course", 400));
  }
  return res.json(
    new ApiResponse("Successfully updated the course ", updatedCourse, 200)
  );
});

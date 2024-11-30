import Course from "../models/course.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import University from "../models/university.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { paginate } from "../utils/pagination.js";

// Create course
export const createCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.create(req.body);
  if (!course) {
    return next(new ApiError("Failed to create the course", 400));
  }
  return res
    .status(201)
    .json(new ApiResponse("Course created successfully", course));
});

// Get all Courses with Pagination -> Need to complete it
export const getAllCourse = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page || "1");
  const limit = parseInt(req.query.limit || "10");
  console.log(req.query);
  const countryId = req.query.countryId;
  const universityId = req.query.universityId;
  const courseLevelId = req.query.courseLevelId;
  const specializationId = req.query.specializationId;
  const duration = req.query.duration; //{ duration: '12,12' }
  const tutionFees = req.query.tutionFees;

  // Set up filter object if necessary
  const filter = {};
  if (countryId) {
    filter.country = countryId;
  }
  if (universityId) {
    filter.university = universityId;
  }
  if (courseLevelId) {
    filter.courseLevel = courseLevelId;
  }
  if (specializationId) {
    filter.specialization = specializationId;
  }
  if (duration) {
    const durationArr = duration.split(","); // [500, 1000]
    filter["duration"] = {
      $gte: parseInt(durationArr[0]),
      $lte: parseInt(durationArr[1]),
    };
  }
  if (tutionFees) {
    const tutionFeesArr = tutionFees.split(","); // [500, 1000]
    filter["tutionFees.amount"] = {
      $gte: parseInt(tutionFeesArr[0]),
      $lte: parseInt(tutionFeesArr[1]),
    };
  }
  console.log(filter);

  // console.log(filter);
  // Use the pagination utility function
  const { data: courses, pagination } = await paginate(
    Course, // The model
    page, // Current page
    limit, // Limit per page
    [], // Optional population (can add if needed, e.g. { path: 'category', select: 'name' })
    filter // Any filtering conditions
  );

  // Check if no courses are found
  if (!courses || courses.length === 0) {
    return next(new ApiError("No courses available", 404));
  }

  // Return paginated response with ApiResponse
  return res
    .status(200)
    .json(new ApiResponse("Courses fetched successfully", courses, pagination));
});

export const getCourseById = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params?.id);
  if (!course) {
    return next(new ApiError("Unable to get the course", 404));
  }
  return res
    .status(200)
    .json(new ApiResponse("Fetched the course", course, 200));
});

export const deleteById = asyncHandler(async (req, res, next) => {
  const remCourse = await Course.findByIdAndDelete(req.params?.id);

  if (!remCourse) {
    return next(new ApiError("Failed to delete the course", 400));
  }
  return res
    .status(200)
    .json(new ApiResponse("Successfully removed the course"));
});

export const updateById = asyncHandler(async (req, res, next) => {
  const courseId = req.params?.id;
  console.log(courseId);
  const {
    title,
    duration,
    courseLevel,
    examType,
    fees,
    location,
    specialization,
  } = req.body;
  console.log(title);
  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    {
      $set: {
        title,
        "duration.minDuration": duration?.minDuration,
        "duration.maxDuration": duration?.maxDuration,
        "fees.minAmount": fees?.minAmount,
        "fees.maxAmount": fees?.maxAmount,
        courseLevel,
        examType,
        location,
        specialization,
      },
    },
    { new: true } // Return the updated document
  );

  if (!updatedCourse) {
    return next(new ApiError("Failed to update the course", 400));
  }
  return res.json(
    new ApiResponse("Successfully updated the course ", updatedCourse, 200)
  );
});

import Course from "../models/course.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import University from "../models/university.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create course handle
export const createCourse = asyncHandler(async (req, res, next) => {
  const {
    title,
    universitySlug,
    slug,
    duration,
    courseLevel,
    examType,
    fees,
    location,
    specialization,
  } = req.body;

  // Find the university by its slug
  const university = await University.findOne({ slug: universitySlug });

  if (!university) {
    return next(new ApiError("Unable to find the university", 400));
  }

  // Check if the course already exists in the same university
  const courseExists = await Course.findOne({
    title,
    university: university._id,
  });

  if (courseExists) {
    return next(
      new ApiError("Course already exists in the current university", 400)
    );
  }

  // Create a new course with the university reference
  const course = new Course({
    title,
    university: university._id, // Referencing the university by ObjectId
    slug,
    duration,
    courseLevel,
    examType,
    fees,
    location,
    specialization,
  });
  const createdCourse = await course.save();
  if (!course) {
    return next(new ApiError("Failed to create the course try again", 400));
  }
  return res
    .status(201)
    .json(new ApiResponse("Course created successfully", createdCourse, 201));
});

// to get all the course
export const getAllCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.find().populate("university");
  if (course.length === 0) {
    return next(new ApiError("No course available", 404));
  }
  return res
    .status(200)
    .json(new ApiResponse("Fetched all the courses", course));
});

// to get the course by id

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

// funtionn to updateCourse

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

import University from "../models/university.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
export const createUniversity = asyncHandler(async (req, res, next) => {
  const {
    name,
    slug,
    location,
    highlights,
    overview,
    contactInfo,
    ranking,
    courses,
    faculties,
  } = req.body;

  const universityExists = await University.findOne({ name });

  if (universityExists) {
    return next(new ApiError("University already exists",400));
  }
  const university = new University({
    name,
    slug,
    location,
    highlights,
    overview,
    contactInfo,
    ranking,
    courses,
    faculties,
  });

  const createdUniversity = await university.save();
  res.status(200).json(new ApiResponse("Created the University", createdUniversity,200));
});

export const getAllUniversities = asyncHandler(async (req, res, next) => {
  const universities = await University.find();

  if (universities.length === 0) {
    return next(new ApiError("Unable to get the resources",400));
  }
  return res.status(200).json(new ApiResponse("Fetched the resources",universities,200));
});


/** get by id */
export const getUniversityById = asyncHandler(async (req, res, next) => {
  const university = await University.findById(req.params.id);

  if (!university) {
    return next(new ApiError("Unable to get the University",400));
  }return res.status(200).json(new ApiResponse("Retrieved the university",university,200));
});

/** delete by id */

export const deleteUniversityById = asyncHandler(async (req, res, next) => {
  const university = await University.findById(req.params.id);

  if (!university) {
   return next(new ApiError("University does not exists",404))  
} await university.remove();
  res.status(200).json(new ApiResponse("Successfully removed the University",null,200));
});

/** update by id */

export const updateUniversityById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find and update the university in one step
  const updatedUniversity = await University.findByIdAndUpdate(
    id,
    req.body, 
    {
      new: true,
      runValidators: true
    } 
  );

  if (!updatedUniversity) {
    return next(new ApiError("Failed to update the data",400));
  }return res.status(200).json(new ApiResponse("Successfully updated the data"));
});
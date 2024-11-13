import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../configs/cloudinary.js";
import University from "../models/university.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a University
export const createUniversity = asyncHandler(async (req, res, next) => {
  const { coverPhoto, logo } = req.files; // Handle file uploads {a: [{}], b: [{}]}
  let coverPhotoResponse = null;
  let logoResponse = null;
  if (coverPhoto && coverPhoto[0]) {
    coverPhotoResponse = await uploadFileToCloudinary(coverPhoto[0]);
  }
  if (logo && logo[0]) {
    logoResponse = await uploadFileToCloudinary(logo[0]);
  }
  const universityData = {
    ...req.body,
    // overview: req.body.overview && JSON.parse(req.body.overview),
    faculties: req.body.faculties && JSON.parse(req.body.faculties),
    coverPhoto: coverPhotoResponse ? coverPhotoResponse[0] : null,
    logo: logoResponse ? logoResponse[0] : null,
  };

  const university = await University.create(universityData);

  if (!university) {
    return next(new ApiError("Failed to create the University", 400));
  }

  return res
    .status(200)
    .json(new ApiResponse("Created the University Successfully", university));
});

// Get a single University
export const getUniversityById = asyncHandler(async (req, res, next) => {
  const university = await University.findById(req.params.id).populate(
    "country"
  );

  if (!university) {
    return next(new ApiError("University not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("University retrieved successfully", university));
});

// Get all Universities
export const getAllUniversities = asyncHandler(async (req, res, next) => {
  const universities = await University.find().populate("country");

  if (!universities) {
    return next(new ApiError("No universities found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Universities retrieved successfully", universities));
});

// Update a University
export const updateUniversityById = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // Get the university ID from the request params
  const { coverPhoto, logo } = req.files; // Handle file uploads {a: [{}], b: [{}]}

  let coverPhotoResponse = null;
  let logoResponse = null;

  // Handle file uploads for cover photo and logo
  if (coverPhoto && coverPhoto[0]) {
    coverPhotoResponse = await uploadFileToCloudinary(coverPhoto[0]);
  }
  if (logo && logo[0]) {
    logoResponse = await uploadFileToCloudinary(logo[0]);
  }

  // Prepare the data for update
  const universityData = {
    ...req.body,
    // overview: req.body.overview && JSON.parse(req.body.overview),  // If overview is string from frontend then need to parse
    faculties: req.body.faculties && JSON.parse(req.body.faculties), // Ensure faculties is parsed correctly
    coverPhoto: coverPhotoResponse ? coverPhotoResponse[0] : undefined, //Only update if new cover photo is provided,mongodb ignore null/undefined
    logo: logoResponse ? logoResponse[0] : undefined, // Only update if new logo is provided
  };

  // Find and update the university
  const university = await University.findByIdAndUpdate(id, universityData, {
    new: true,
  });

  // Check if university was not found or update failed
  if (!university) {
    return next(new ApiError("University not found or update failed", 404));
  }

  // Send success response
  return res.status(200).json({
    message: "University updated successfully",
    data: university,
  });
});

// Delete a University
export const deleteUniversityById = asyncHandler(async (req, res, next) => {
  const university = await University.findById(req.params.id);

  if (!university) {
    return next(new ApiError("University not found", 404));
  }

  // Delete images from Cloudinary
  if (university.coverPhoto?.public_id)
    await deleteFileFromCloudinary(university.coverPhoto.public_id);
  if (university.logo?.public_id)
    await deleteFileFromCloudinary(university.logo.public_id);

  await university.remove();

  return res
    .status(200)
    .json(new ApiResponse("University deleted successfully"));
});

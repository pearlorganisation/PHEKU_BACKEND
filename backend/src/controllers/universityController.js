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

  const university = await University.create({
    ...req.body,
    faculties: req.body.faculties && JSON.parse(req.body.faculties),
    ranking: req.body.ranking && JSON.parse(req.body.ranking),
    coverPhoto: coverPhotoResponse ? coverPhotoResponse[0] : null,
    logo: logoResponse ? logoResponse[0] : null,
  });

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


/* query search parameter to search by country */
const constructUniversitySearch = (queryParams) => {
  let constructedQuery = {};

  if (queryParams.country) {
    // Assuming `queryParams.country` contains the ObjectId string for the country
    constructedQuery.country = queryParams.country;
  }

  return constructedQuery;
};

// Get all Universities
export const getAllUniversities = asyncHandler(async (req, res, next) => {
  // Construct the query based on request parameters
  console.log(req.query,"the data")
  const queryObj = constructUniversitySearch(req.query);
  // console.log(queryObj);
  const universities = await University.find(queryObj).populate("country");

  // const universities = await University.find(queryObj); // Use queryObj to filter results
  if (universities.length === 0) {
    return next(new ApiError("Unable to get the resources", 400));
  }
  if (!universities) {
    return next(new ApiError("No universities found", 404));
  }return res
    .status(200)
    .json(new ApiResponse("Universities retrieved successfully", universities));
});


// Update a University
export const updateUniversityById = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // Get the university ID from the request params
  const { coverPhoto, logo } = req.files; // Handle file uploads {a: [{}], b: [{}]}

  // Fetch the university to check for existing images
  const existingUniversity = await University.findById(id);
  if (!existingUniversity) {
    return next(new ApiError("University not found", 404));
  }
  let coverPhotoResponse = null;
  let logoResponse = null;

  // Delete the old cover photo from Cloudinary if it exists and a new one is provided
  if (coverPhoto && coverPhoto[0]) {
    coverPhotoResponse = await uploadFileToCloudinary(coverPhoto[0]);
    if (existingUniversity.coverPhoto) {
      await deleteFileFromCloudinary(existingUniversity.coverPhoto); // Delete old cover photo
    }
  }

  // Delete the old logo from Cloudinary if it exists and a new one is provided
  if (logo && logo[0]) {
    logoResponse = await uploadFileToCloudinary(logo[0]);
    if (existingUniversity.logo) {
      await deleteFileFromCloudinary(existingUniversity.logo); // Delete old logo
    }
  }

  // Prepare the data for update
  const universityData = {
    ...req.body,
    faculties: req.body.faculties && JSON.parse(req.body.faculties),
    ranking: req.body.ranking && JSON.parse(req.body.ranking),
    coverPhoto: coverPhotoResponse ? coverPhotoResponse[0] : undefined, //Only update if new cover photo is provided,mongodb ignore null/undefined
    logo: logoResponse ? logoResponse[0] : undefined, // Only update if new logo is provided
  };

  // Find and update the university
  const university = await University.findByIdAndUpdate(id, universityData, {
    new: true,
    runValidators: true,
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
  const deletedUniversity = await University.findByIdAndDelete(req.params.id);

  if (!deletedUniversity) {
    return next(new ApiError("University not found", 404));
  }

  // Delete images from Cloudinary
  if (deletedUniversity?.coverPhoto)
    await deleteFileFromCloudinary(deletedUniversity.coverPhoto);
  if (deletedUniversity?.logo)
    await deleteFileFromCloudinary(deletedUniversity.logo);

  return res
    .status(200)
    .json(new ApiResponse("University deleted successfully"));
});

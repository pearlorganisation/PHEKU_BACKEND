import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../../configs/cloudinary.js";
import Country from "../../models/country/country.js";
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { paginate } from "../../utils/pagination.js";

// Create a new Country (only name)
export const createCountry = asyncHandler(async (req, res, next) => {
  const { thumbImage, coverPhoto } = req.files; // Handle file uploads {thumbImage: [{}], coverPhoto: [{}]}

  let thumbImageResponse = null;
  let coverPhotoResponse = null;

  if (thumbImage && thumbImage[0]) {
    thumbImageResponse = await uploadFileToCloudinary(thumbImage[0]);
  }

  if (coverPhoto && coverPhoto[0]) {
    coverPhotoResponse = await uploadFileToCloudinary(coverPhoto[0]);
  }

  const { name, slug, about } = req.body;

  const country = await Country.create({
    name,
    slug,
    about,
    thumbImage: thumbImageResponse ? thumbImageResponse[0] : null, // If upload fail we can know that as it is  null in db
    coverPhoto: coverPhotoResponse ? coverPhotoResponse[0] : null,
  });

  if (!country) {
    return next(new ApiError("Failed to create the Country", 400));
  }

  return res
    .status(201)
    .json(new ApiResponse("Created the Country successfully", country));
});

// Get all countries (only name) with pagination
export const getCountries = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page || "1");
  const limit = parseInt(req.query.limit || "10");

  const fields = req.query.fields || ""; // fields=name for dropdown

  // Use the pagination utility function
  const { data: countries, pagination } = await paginate(
    Country,
    page,
    limit,
    [],
    {},
    fields
  ); // Add a field as this will use in other places too

  // Check if no countries found
  if (!countries || countries.length === 0) {
    return next(new ApiError("No countries found", 404));
  }

  // Return paginated response with ApiResponse
  return res
    .status(200)
    .json(
      new ApiResponse("Countries retrieved successfully", countries, pagination)
    );
});

// Get a single country by ID (only name)
export const getCountryById = asyncHandler(async (req, res, next) => {
  const country = await Country.findById(req.params.id);

  if (!country) {
    return next(new ApiError("Country not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Country retrieved successfully", country));
});

// Update a country (only name)
export const updateCountryById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { thumbImage, coverPhoto } = req.files; // Handle file uploads { thumbImage: [{}], coverPhoto: [{}] }

  // Fetch the country to check for existing images
  const existingCountry = await Country.findById(id);
  if (!existingCountry) {
    return next(new ApiError("Country not found", 404));
  }

  let thumbImageResponse = null;
  let coverPhotoResponse = null;

  // Delete the old thumb image from Cloudinary if it exists and a new one is provided
  if (thumbImage && thumbImage[0]) {
    thumbImageResponse = await uploadFileToCloudinary(thumbImage[0]);
    if (existingCountry.thumbImage) {
      await deleteFileFromCloudinary(existingCountry.thumbImage); // Delete old thumb image
    }
  }

  // Delete the old cover photo from Cloudinary if it exists and a new one is provided
  if (coverPhoto && coverPhoto[0]) {
    coverPhotoResponse = await uploadFileToCloudinary(coverPhoto[0]);
    if (existingCountry.coverPhoto) {
      await deleteFileFromCloudinary(existingCountry.coverPhoto); // Delete old cover photo
    }
  }

  // Prepare the data for update
  const countryData = {
    ...req.body,
    thumbImage: thumbImageResponse ? thumbImageResponse[0] : undefined, //Only update if new thumb image is provided, otherwise mongo ignore it
    coverPhoto: coverPhotoResponse ? coverPhotoResponse[0] : undefined,
  };

  // Find and update the country
  const country = await Country.findByIdAndUpdate(id, countryData, {
    new: true,
    runValidators: true,
  });

  if (!country) {
    return next(new ApiError("Failed to update the Country", 400));
  }

  return res
    .status(200)
    .json(new ApiResponse("Country updated successfully", country));
});

// Delete a country
export const deleteCountryById = asyncHandler(async (req, res, next) => {
  const deletedCountry = await Country.findByIdAndDelete(req.params.id).lean();

  if (!deletedCountry) {
    return next(new ApiError("Country not found", 404));
  }
  // Delete images from Cloudinary
  if (deletedCountry?.coverPhoto) {
    await deleteFileFromCloudinary(deletedCountry.coverPhoto);
  }
  if (deletedCountry?.thumbImage) {
    await deleteFileFromCloudinary(deletedCountry.thumbImage);
  }
  return res.status(200).json(new ApiResponse("Country deleted successfully"));
});

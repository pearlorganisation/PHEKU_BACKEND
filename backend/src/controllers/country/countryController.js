import Country from "../../models/country/country.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new Country (only name)
export const createCountry = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  // Create country with the name
  const country = await Country.create({ name });

  if (!country) {
    return next(new ApiError("Failed to create the Country", 400));
  }

  return res
    .status(200)
    .json(new ApiResponse("Created the Country successfully", country));
});

// Get all countries (only name)
export const getCountries = asyncHandler(async (req, res, next) => {
  const countries = await Country.find(); // Fetch only the 'name' field

  if (!countries || countries.length === 0) {
    return next(new ApiError("No countries found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Countries retrieved successfully", countries));
});

// Get a single country by ID (only name)
export const getCountryById = asyncHandler(async (req, res, next) => {
  const country = await Country.findById(req.params.id, "name"); // Fetch only the 'name' field

  if (!country) {
    return next(new ApiError("Country not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Country retrieved successfully", country));
});

// Update a country (only name)
export const updateCountryById = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const country = await Country.findByIdAndUpdate(
    req.params.id,
    { name },
    {
      new: true, // Return the updated document
      runValidators: true, // Ensure validation rules are applied
    }
  );

  if (!country) {
    return next(new ApiError("Failed to update the Country", 400));
  }

  return res
    .status(200)
    .json(new ApiResponse("Country updated successfully", country));
});

// Delete a country
export const deleteCountryById = asyncHandler(async (req, res, next) => {
  const country = await Country.findByIdAndDelete(req.params.id);

  if (!country) {
    return next(new ApiError("Country not found", 404));
  }

  return res.status(200).json(new ApiResponse("Country deleted successfully"));
});

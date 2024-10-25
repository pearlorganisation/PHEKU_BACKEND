import Accommodation from "../models/accomodation.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadFileToCloudinary } from "../utils/cloudinary.js";

export const createAccomodation = asyncHandler(async (req, res, next) => {
  const images = req.files; // Handle file uploads
  const response = await uploadFileToCloudinary(images);

  // Parse JSON fields from req.body if necessary
  const location = req.body.location ? JSON.parse(req.body.location) : null;
  const fees = req.body.fees ? JSON.parse(req.body.fees) : null;
  const contactInfo = req.body.contactInfo
    ? JSON.parse(req.body.contactInfo)
    : null;

  // Create accommodation using the parsed data
  const accomodation = await Accommodation.create({
    ...req.body,
    location,
    fees,
    contactInfo,
    images: response, // Set the uploaded images
  });

  if (!accomodation) {
    return next(new ApiError("Failed to create the Accommodation", 400));
  }

  return res
    .status(200)
    .json(
      new ApiResponse("Created the Accommodation Successfully", accomodation)
    );
});

export const getAllAccomodation = asyncHandler(async (req, res, next) => {
  const data = await Accommodation.find();
  if (data.length === 0) {
    return next(new ApiError("Unable to get the resources", 400));
  }
  return res
    .status(200)
    .json(new ApiResponse("Successfully retrieved the resources", data, 200));
});

/** Get a single accomodation */

export const getAccomodationById = asyncHandler(async (req, res, next) => {
  const accomodationId = req.params?.id;
  const data = await Accommodation.findById(accomodationId);
  if (!data) {
    return next(new ApiError("Unable to get the data", 400));
  }
  return res
    .status(200)
    .json(new ApiResponse("Successfully retrieved the data", data, 200));
});

/** delete a accomodation */
export const deleteAccomodationById = asyncHandler(async (req, res, next) => {
  const accomodationId = req.params?.id;
  const data = await Accommodation.findByIdAndDelete(accomodationId);
  if (!data) {
    return next(new ApiError("Unable to delete the resource", 400));
  }
  return res
    .status(200)
    .json(new ApiResponse("Successfully deleted the resource", null, 200));
});

export const updateAccomodationById = asyncHandler(async (req, res, next) => {
  const id = req.params?.id;
  const {
    name,
    type,
    location,
    capacity,
    availableSpaces,
    amenities,
    fees,
    description,
    contactInfo,
    owner,
  } = req.body;

  const data = await Accommodation.findByIdAndUpdate(
    id,
    {
      $set: {
        name,
        type,
        location,
        capacity,
        availableSpaces,
        amenities,
        "fees.monthly": fees?.monthly,
        "fees.securityDeposit": fees?.securityDeposit,
        description,
        "contactInfo.phone": contactInfo?.phone,
        "contactInfo.email": contactInfo?.email,
        "owner.name": owner?.name,
        "owner.phone": owner?.phone,
        "owner.email": owner?.email,
      },
    },
    { new: true }
  );

  if (!data) {
    return next(new ApiError("Unable to update the data", 404));
  }
  return res
    .status(200)
    .json(new ApiResponse("Successfully update the resource", data, 200));
});

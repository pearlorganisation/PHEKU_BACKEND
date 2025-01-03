import Accommodation from "../models/accomodation.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadFileToCloudinary } from "../configs/cloudinary.js";
import { paginate } from "../utils/pagination.js";

export const createAccomodation = asyncHandler(async (req, res, next) => {
  const { images, amenities } = req.files;
  // console.log(req.files);

  // Parse JSON fields from req.body if necessary
  const amenitiesNames = req.body.amenitiesNames
    ? JSON.parse(req.body.amenitiesNames)
    : []; //USE []-> amenitiesNamesArray.map() will work without throwing errors
  const location = req.body.location ? JSON.parse(req.body.location) : [];
  const fees = req.body.fees ? JSON.parse(req.body.fees) : [];
  const contactInfo = req.body.contactInfo
    ? JSON.parse(req.body.contactInfo)
    : [];

  const uploadedImages = images ? await uploadFileToCloudinary(images) : [];
  console.log(amenitiesNames);

  // Handle amenities upload
  const uploadedAmenities = [];
  if (amenities) {
    // Array of images, if single image come {}, put it in array
    const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
    const uploadedIcons = await Promise.all(
      amenitiesArray.map(async (file, index) => {
        const name = amenitiesNames[index] || `Amenity ${index + 1}`; // Accessing the index of amenitiesNames which is equal to index of amenitiesArray
        console.log(name);
        const uploaded = await uploadFileToCloudinary(file); // Assuming uploadFileToCloudinary returns an object
        return { name, icon: uploaded[0] }; // Return the structured object with [name] and [icon]
      })
    );
    //uploadedIcons:  It contain the [{name: "",icon: ""}, {}]
    uploadedAmenities.push(...uploadedIcons);
  }
  // console.log(uploadedAmenities);

  // Create accommodation using the parsed data
  const accomodation = await Accommodation.create({
    ...req.body,
    location,
    fees,
    contactInfo,
    images: uploadedImages,
    amenities: uploadedAmenities,
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
  const page = parseInt(req.query.page || "1");
  const limit = parseInt(req.query.limit || "10");
  const { data: accommodation, pagination } = await paginate(
    Accommodation,
    page,
    limit,
    [{ path: "location.country", select: "name" }]
  );

  // Check if no universities found
  if (!accommodation || accommodation.length === 0) {
    return next(new ApiError("No universities found", 404));
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        "Successfully retrieved the resources",
        accommodation,
        pagination
      )
    );
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

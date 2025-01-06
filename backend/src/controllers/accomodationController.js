import Accommodation from "../models/accomodation.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../configs/cloudinary.js";
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
  const { search } = req.query;
  const filter = {};
  if (search) {
    // Case-insensitive search on name and city fields
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
      { type: { $regex: search, $options: "i" } },
      { state: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
      { district: { $regex: search, $options: "i" } },
      { ownerName: { $regex: search, $options: "i" } },
    ];
  }
  const { data: accommodation, pagination } = await paginate(
    Accommodation,
    page,
    limit,
    [{ path: "location.country", select: "name" }],
    filter
  );

  // Check if no universities found
  if (!accommodation || accommodation.length === 0) {
    return next(new ApiError("No universities found", 404));
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        "Accommodations found successfully",
        accommodation,
        pagination
      )
    );
});

export const getAccomodationById = asyncHandler(async (req, res, next) => {
  const accomodationId = req.params?.id;
  const accommodation = await Accommodation.findById(accomodationId);
  if (!accommodation) {
    return next(new ApiError("Unable to get the data", 400));
  }
  return res
    .status(200)
    .json(new ApiResponse("Successfully retrieved the data", accommodation));
});

//Need to add fuctionality to delete the images from cloudinary
export const deleteAccomodationById = asyncHandler(async (req, res, next) => {
  const deletedAccommodation = await Accommodation.findByIdAndDelete(
    req.params?.id
  );
  if (!deletedAccommodation) {
    return next(new ApiError("Accommodation not found", 404));
  }
  if (deletedAccommodation.images) {
    await deleteFileFromCloudinary(deletedAccommodation.images);
  }
  if (deletedAccommodation.amenities) {
    await Promise.all(
      deletedAccommodation.amenities.map(async (amenity) => {
        await deleteFileFromCloudinary([amenity.icon]);
      })
    );
  }
  return res
    .status(200)
    .json(new ApiResponse("Accommodation deleted successfully"));
});

//need to add functionality to delete the images from cloudinary and do some modification in the update
export const updateAccomodationById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { images, amenities } = req.files; // req.files= {images: [], amenities: []}
  const amenitiesNames = req.body.amenitiesNames
    ? JSON.parse(req.body.amenitiesNames)
    : [];

  const existingAccommodation = await Accommodation.findById(id);
  if (!existingAccommodation) {
    return next(new ApiError("Accommodation not found", 404));
  }
  let uploadedImages;
  if (images) {
    uploadedImages = await uploadFileToCloudinary(images);
    if (existingAccommodation.images) {
      // Delete old images from Cloudinary
      await deleteFileFromCloudinary(existingAccommodation.images); // images: [{},{}]
    }
  }
  console.log("Uploaded images: ", uploadedImages);

  let uploadedAmenities = [];
  // Handle amenities upload
  if (amenities) {
    // Array of images, if single image come {}, put it in array
    const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
    const uploadedIcons = await Promise.all(
      amenitiesArray.map(async (file, index) => {
        const name = amenitiesNames[index] || `Amenity ${index + 1}`; // Accessing the index of amenitiesNames which is equal to index of amenitiesArray
        const uploaded = await uploadFileToCloudinary(file); // Assuming uploadFileToCloudinary returns an object
        return { name, icon: uploaded[0] }; // Return the structured object with [name] and [icon]
      })
    );
    //uploadedIcons:  It contain the [{name: "",icon: ""}, {}]
    uploadedAmenities.push(...uploadedIcons);
  }
  console.log("Uploaded Ameni: ", uploadedAmenities);

  const accommodationData = {
    ...req.body,
    location: req.body.location && JSON.parse(req.body.location),
    fees: req.body.fees && JSON.parse(req.body.fees),
    contactInfo: req.body.contactInfo && JSON.parse(req.body.contactInfo),
    images: uploadedImages || undefined,
    amenities: uploadedAmenities.length > 0 ? uploadedAmenities : undefined, // Only update if new amenities are provided
  };

  const accommodation = await Accommodation.findByIdAndUpdate(
    id,
    accommodationData,
    {
      new: true,
    }
  );

  if (!accommodation) {
    return next(new ApiError("Accommodation failed to update", 400));
  }
  return res
    .status(200)
    .json(new ApiResponse("Accommodation updated successfully", accommodation));
});

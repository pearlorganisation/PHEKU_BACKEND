import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../configs/cloudinary.js";
import University from "../models/university.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginate } from "../utils/pagination.js";

// Create a University
export const createUniversity = asyncHandler(async (req, res, next) => {
  const { coverPhoto, logo } = req.files; // Handle file uploads {a: [{}], b: [{}]}
  console.log(req.body);
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
    universityCoordinates: {
      type: "Point",
      coordinates: [req.body.latitude, req.body.longitude],
    },
    faculties: req.body.faculties && JSON.parse(req.body.faculties),
    ranking: req.body.ranking && JSON.parse(req.body.ranking),
    coverPhoto: coverPhotoResponse ? coverPhotoResponse[0] : null,
    logo: logoResponse ? logoResponse[0] : null,
  });

  if (!university) {
    return next(new ApiError("Failed to create the University", 400));
  }

  return res
    .status(201)
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
  const page = parseInt(req.query.page || "1");
  const limit = parseInt(req.query.limit || "10");
  const { country, search } = req.query; // country is id

  // Set up filter object for the paginate function
  const filter = {};
  if (country) {
    filter.country = country; // Assuming country is stored as an ID reference in University model
  }
  if (search) {
    // Case-insensitive search on name and city fields
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { state: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
      { district: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
    ];
  }

  // Use the pagination utility function
  const { data: universities, pagination } = await paginate(
    University,
    page,
    limit,
    [{ path: "country", select: "name" }],
    filter
  );

  // Check if no universities found
  if (!universities || universities.length === 0) {
    return next(new ApiError("No universities found", 404));
  }

  // Return paginated response with ApiResponse
  return res
    .status(200)
    .json(
      new ApiResponse(
        "Universities retrieved successfully",
        universities,
        pagination
      )
    );
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
  return res
    .status(200)
    .json(new ApiResponse("University updated successfully", university));
});

// Delete a University
export const deleteUniversityById = asyncHandler(async (req, res, next) => {
  //Mongoose wraps schema fields into its internal MongooseDocument wrapper, especially when the field is nullable or uninitialized. Use lean()
  const deletedUniversity = await University.findByIdAndDelete(
    req.params.id
  ).lean();

  if (!deletedUniversity) {
    return next(new ApiError("University not found", 404));
  }
  // Delete images from Cloudinary
  if (deletedUniversity?.coverPhoto)
    // Use lean so that we get null if not photo is there
    await deleteFileFromCloudinary(deletedUniversity.coverPhoto);
  if (deletedUniversity?.logo)
    await deleteFileFromCloudinary(deletedUniversity.logo);

  return res
    .status(200)
    .json(new ApiResponse("University deleted successfully"));
});

export const syncFaculties = asyncHandler(async (req, res, next) => {
  const { universityId } = req.params;
  const { addFaculties, removeFacultyIds } = req.body; // Arrays of faculties to add and IDs to remove
  const facultiesToAdd = Array.isArray(addFaculties)
    ? addFaculties
    : [addFaculties]; // Ensure it's always an array, No need for removeFacultyIds as we using $in

  const updateOperations = [];

  if (facultiesToAdd?.length) {
    updateOperations.push({
      updateOne: {
        filter: { _id: universityId },
        update: { $push: { faculties: { $each: facultiesToAdd } } }, // [{},{}] -> each object will be pushed
      },
    });
  }

  if (removeFacultyIds?.length) {
    updateOperations.push({
      updateOne: {
        filter: { _id: universityId },
        update: { $pull: { faculties: { _id: { $in: removeFacultyIds } } } }, //$in operator is used to check if the faculty._id is in the removeFacultyIds array.
      },
    });
  }

  if (updateOperations.length > 0) {
    await University.bulkWrite(updateOperations);
  }

  // Clean up `null` values and fetch the updated university in a single query
  const updatedUniversity = await University.findOneAndUpdate(
    { _id: universityId },
    { $pull: { faculties: null } }, // Remove `null` values
    { new: true }
  );

  if (!updatedUniversity) {
    return next(new ApiError("University not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Faculties synced successfully", updatedUniversity));
});

export const findNearbyUniversities = async (req, res, next) => {
  const { lng, lat, maxDistanceInMeters } = req.query;

  //Geospatial query to find nearby universities
  const nearbyUniversities = await University.find({
    universityCoordinates: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)], // Use accommodation's coordinates
        },
        $maxDistance: parseInt(maxDistanceInMeters, 10), // Maximum distance in meters
      },
    },
  });

  res
    .status(200)
    .json(new ApiResponse("Nearby universities found", nearbyUniversities));
};

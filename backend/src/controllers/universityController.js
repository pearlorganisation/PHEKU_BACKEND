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
  const { coverPhoto, logo } = req.files;
  const university = await University.findById(req.params.id);

  if (!university) {
    return next(new ApiError("University not found", 404));
  }

  // Upload new images if provided
  if (coverPhoto) {
    if (university.coverPhoto?.public_id)
      await deleteFileFromCloudinary(university.coverPhoto.public_id);
    const coverPhotoResponse = await uploadFileToCloudinary(coverPhoto[0]);
    university.coverPhoto = {
      secure_url: coverPhotoResponse.secure_url,
      public_id: coverPhotoResponse.public_id,
    };
  }

  if (logo) {
    if (university.logo?.public_id)
      await deleteFileFromCloudinary(university.logo.public_id);
    const logoResponse = await uploadFileToCloudinary(logo[0]);
    university.logo = {
      secure_url: logoResponse.secure_url,
      public_id: logoResponse.public_id,
    };
  }

  // Update other fields
  Object.assign(university, req.body);

  const updatedUniversity = await university.save();

  return res
    .status(200)
    .json(
      new ApiResponse("University updated successfully", updatedUniversity)
    );
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

// import University from "../models/university.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiResponse } from "../utils/ApiResponse.js"
// import ApiError from "../utils/ApiError.js"
// import { z } from "zod";
// // validation for creating university
// const universitySchema = z.object({
//   name: z.string(),
//   slug: z.string().optional(),
//   location: z.string(),
//   highlights: z.string().optional(),
//   overview: z.string().optional(),
//   contactInfo: z.object({
//       email: z.string().optional(),
//       website: z.string().optional(),
//     }).optional(),
//     ranking: z.object({
//       global: z.number().optional(),
//       national: z.number().optional(),
//     }).optional(),
//   courses: z.array(z.string()).optional(),
// });
// export const createUniversity = asyncHandler(async (req, res, next) => {
//   const {
//     name,
//     slug,
//     location,
//     highlights,
//     overview,
//     contactInfo,
//     ranking,
//     courses,
//     faculties,
//   } = req.body;

//     const parsedData = universitySchema.safeParse(req.body);

//     if (!parsedData.success) {
//       return next(new ApiError("Invalid input data", 400, parsedData.error));
//     }

//     const universityExists = await University.findOne({
//       name
//     });

//     if (universityExists) {
//       return next(new ApiError("University already exists", 400));
//     }

//     const university = new University({
//       name,
//       slug,
//       location,
//       highlights,
//       overview,
//       contactInfo,
//       ranking,
//       courses,
//       faculties,
//     });

//     const createdUniversity = await university.save();

//     res.status(200).json(new ApiResponse("Created the University", createdUniversity, 200));
// });

// export const getAllUniversities = asyncHandler(async (req, res, next) => {
//   const universities = await University.find();

//   if (universities.length === 0) {
//     return next(new ApiError("Unable to get the resources",400));
//   }
//   return res.status(200).json(new ApiResponse("Fetched the resources",universities,200));
// });

// /** get by id */
// export const getUniversityById = asyncHandler(async (req, res, next) => {
//   const university = await University.findById(req.params.id);

//   if (!university) {
//     return next(new ApiError("Unable to get the University",400));
//   }return res.status(200).json(new ApiResponse("Retrieved the university",university,200));
// });

// /** delete by id */

// export const deleteUniversityById = asyncHandler(async (req, res, next) => {
//   const university = await University.findById(req.params.id);

//   if (!university) {
//    return next(new ApiError("University does not exists",404))
// } await university.remove();
//   res.status(200).json(new ApiResponse("Successfully removed the University",null,200));
// });

// /** update by id */
// export const updateUniversityById = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;

//   // Find and update the university in one step
//   const updatedUniversity = await University.findByIdAndUpdate(
//     id,
//     req.body,
//     {
//       new: true,
//       runValidators: true
//     }
//   );

//   if (!updatedUniversity) {
//     return next(new ApiError("Failed to update the data",400));
//   }return res.status(200).json(new ApiResponse("Successfully updated the data"));
// });

import BlogCategory from "../../models/blog/blogCategory.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";

// Create a new Blog Category
export const createBlogCategory = asyncHandler(async (req, res, next) => {
  const { blogCategoryName } = req.body;

  // Create category with the name
  const blogCategory = await BlogCategory.create({ blogCategoryName });

  if (!blogCategory) {
    return next(new ApiError("Failed to create the Blog Category", 400));
  }

  return res
    .status(200)
    .json(
      new ApiResponse("Created the Blog Category successfully", blogCategory)
    );
});

// Get all Blog Categories
export const getBlogCategories = asyncHandler(async (req, res, next) => {
  const blogCategories = await BlogCategory.find(); // Fetch all fields

  if (!blogCategories || blogCategories.length === 0) {
    return next(new ApiError("No blog categories found", 404));
  }

  return res
    .status(200)
    .json(
      new ApiResponse("Blog categories retrieved successfully", blogCategories)
    );
});

// Get a single Blog Category by ID
export const getBlogCategoryById = asyncHandler(async (req, res, next) => {
  const blogCategory = await BlogCategory.findById(req.params.id); // Fetch all fields

  if (!blogCategory) {
    return next(new ApiError("Blog Category not found", 404));
  }

  return res
    .status(200)
    .json(
      new ApiResponse("Blog Category retrieved successfully", blogCategory)
    );
});

// Update a Blog Category
export const updateBlogCategoryById = asyncHandler(async (req, res, next) => {
  const { blogCategoryName } = req.body;

  const blogCategory = await BlogCategory.findByIdAndUpdate(
    req.params.id,
    { blogCategoryName },
    {
      new: true, // Return the updated document
      runValidators: true, // Ensure validation rules are applied
    }
  );

  if (!blogCategory) {
    return next(new ApiError("Failed to update the Blog Category", 400));
  }

  return res
    .status(200)
    .json(new ApiResponse("Blog Category updated successfully", blogCategory));
});

// Delete a Blog Category
export const deleteBlogCategoryById = asyncHandler(async (req, res, next) => {
  const blogCategory = await BlogCategory.findByIdAndDelete(req.params.id);

  if (!blogCategory) {
    return next(new ApiError("Blog Category not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Blog Category deleted successfully"));
});

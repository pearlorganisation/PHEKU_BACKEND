import { uploadFileToCloudinary } from "../../configs/cloudinary.js";
import Blog from "../../models/blog/blog.js";
import BlogCategory from "../../models/blog/blogCategory.js";
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { paginate } from "../../utils/pagination.js";

// Create a new blog post
export const createBlog = asyncHandler(async (req, res, next) => {
  const thumbImage = req.file;
  console.log(thumbImage);
  let thumbImageResponse = null;
  if (thumbImage) {
    thumbImageResponse = await uploadFileToCloudinary(thumbImage);
    console.log("RES:: ", thumbImageResponse);
  }
  // Check if category exists
  const categoryExists = await BlogCategory.findById(req.body.category);
  if (!categoryExists) {
    return next(new ApiError("Invalid category ID", 400));
  }

  // Create a new blog post
  const blog = await Blog.create({
    ...req.body,
    thumbImage: thumbImageResponse[0],
  });

  if (!blog) {
    return next(new ApiError("Failed to create the blog post", 400));
  }

  return res
    .status(201)
    .json(new ApiResponse("Created the blog post successfully", blog));
});

// Get all blog posts
export const getAllBlogs = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page || "1");
  const limit = parseInt(req.query.limit || "5");
  const { category } = req.query;

  // Set up filter object for the paginate function
  const filter = {};
  if (category) {
    filter.category = category; // Assuming category is stored as an ID reference in Blog model
  }
  // Use the pagination utility function
  const { data: blogs, pagination } = await paginate(
    Blog,
    page,
    limit,
    [
      { path: "author", select: "fullName email" },
      { path: "category", select: "blogCategoryName" },
    ],
    filter
  );

  // Return paginated response with ApiResponse
  return res
    .status(200)
    .json(
      new ApiResponse("Fetched all blog posts successfully", blogs, pagination)
    );
});

// Get a single blog post by ID
export const getBlogById = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id)
    .populate("author", "name email")
    .populate("category", "blogCategoryName");

  if (!blog) {
    return next(new ApiError("Blog post not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Fetched the blog post successfully", blog));
});

// Update a blog post
export const updateBlogById = asyncHandler(async (req, res, next) => {
  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedBlog) {
    return next(new ApiError("Blog post not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Updated the blog post successfully", updatedBlog));
});

// Delete a blog post
export const deleteBlogbyId = asyncHandler(async (req, res, next) => {
  const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

  if (!deletedBlog) {
    return next(new ApiError("Blog post not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Deleted the blog post successfully", deletedBlog));
});

// Get recent blog posts
export const getRecentBlogs = asyncHandler(async (req, res, next) => {
  const { limit = 5 } = req.query; // Default limit to 5 if not provided

  // Fetch recent blogs based on publication date
  const recentBlogs = await Blog.find()
    .populate("author", "name email")
    .populate("category", "blogCategoryName")
    .sort({ publishedAt: -1 }) // Sort by latest published
    .limit(Number(limit)); // Limit number of results

  return res
    .status(200)
    .json(
      new ApiResponse("Fetched recent blog posts successfully", recentBlogs)
    );
});

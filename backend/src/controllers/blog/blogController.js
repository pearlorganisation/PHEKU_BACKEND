import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../../configs/cloudinary.js";
import Blog from "../../models/blog/blog.js";
import BlogCategory from "../../models/blog/blogCategory.js";
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { paginate } from "../../utils/pagination.js";

// Create a new blog post
export const createBlog = asyncHandler(async (req, res, next) => {
  const thumbImage = req.file;
  let thumbImageResponse = null;
  if (thumbImage) {
    thumbImageResponse = await uploadFileToCloudinary(thumbImage); // Res-> [{}]
  }
  // Check if category exists
  const categoryExists = await BlogCategory.findById(req.body.category);
  if (!categoryExists) {
    return next(new ApiError("Invalid category ID", 400));
  }

  // Create a new blog post
  const blog = await Blog.create({
    ...req.body,
    thumbImage: (thumbImageResponse && thumbImageResponse[0]) || null, // If no image null will set, undefined ignored the field
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
  const limit = parseInt(req.query.limit || "10");
  const { category, search } = req.query;

  // Set up filter object for the paginate function
  const filter = {};
  if (category) {
    filter.category = category; // Assuming category is stored as an ID reference in Blog model
  }

  // If a search term is provided, add it to the filter for title
  if (search) {
    filter.title = { $regex: search, $options: "i" };
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
    filter,
    "publishedAt" //Send here only to sort the blog at this field
  );

  // Check if no blogs found
  if (!blogs || blogs.length === 0) {
    return next(new ApiError("No blogs found", 404));
  }

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
    .populate("author", "fullName email role")
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
  const { id } = req.params; // Get the blog post ID from the request params
  const thumbImage = req.file; // Handle file upload for thumbImage if it exists

  // Fetch the blog post to check for existing thumbImage
  const existingBlog = await Blog.findById(id);
  if (!existingBlog) {
    return next(new ApiError("Blog post not found", 404));
  }

  let thumbImageResponse = null;

  // Delete the old thumbImage from Cloudinary if it exists and a new one is provided
  if (thumbImage) {
    thumbImageResponse = await uploadFileToCloudinary(thumbImage); // Upload new thumbImage first
    if (existingBlog.thumbImage) {
      await deleteFileFromCloudinary(existingBlog.thumbImage); // If upload succeeds, delete the old thumbImage
    }
  }
  // Prepare the data for update
  const blogData = {
    ...req.body,
    thumbImage: thumbImageResponse ? thumbImageResponse[0] : undefined, // can't use null here as it set null in db if not required
  };

  // Find and update the blog post
  const updatedBlog = await Blog.findByIdAndUpdate(id, blogData, {
    new: true,
    runValidators: true,
  });

  // Check if update was successful
  if (!updatedBlog) {
    return next(new ApiError("Blog post not found or update failed", 404));
  }

  // Send success response
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

  // Delete images from Cloudinary
  if (deletedBlog?.thumbImage)
    await deleteFileFromCloudinary(deletedBlog.thumbImage);

  return res
    .status(200)
    .json(new ApiResponse("Deleted the blog post successfully"));
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
